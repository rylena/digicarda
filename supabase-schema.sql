-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  profile_picture_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create cards table (one per user)
create table cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade unique not null,
  name text not null,
  username text unique not null,
  profile_picture_url text,
  emails text[], -- Array of email addresses
  phone_numbers text[], -- Array of phone numbers
  whatsapp text,
  location text,
  instagram text,
  images text[], -- Array of image URLs
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table cards enable row level security;

-- Profiles policies
create policy "Users can view all profiles"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Cards policies
create policy "Anyone can view cards"
  on cards for select
  using (true);

create policy "Users can update own card"
  on cards for update
  using (auth.uid() = user_id);

create policy "Users can insert own card"
  on cards for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own card"
  on cards for delete
  using (auth.uid() = user_id);

-- Function to automatically create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
declare
  v_username text;
  v_full_name text;
  v_attempts int := 0;
begin
  -- Extract username and full_name from metadata
  v_username := coalesce(new.raw_user_meta_data->>'username', '');
  v_full_name := new.raw_user_meta_data->>'full_name';
  
  -- Ensure username is not null or empty (use email prefix as fallback)
  if v_username is null or v_username = '' or trim(v_username) = '' then
    v_username := split_part(new.email, '@', 1);
  end if;
  
  -- Clean username (remove any invalid characters)
  v_username := lower(regexp_replace(v_username, '[^a-z0-9_]', '', 'g'));
  
  -- Ensure username is not empty after cleaning
  if v_username = '' then
    v_username := 'user_' || substr(new.id::text, 1, 8);
  end if;
  
  -- Try to insert profile with conflict handling
  loop
    begin
      insert into profiles (id, username, full_name)
      values (new.id, v_username, v_full_name);
      exit; -- Success, exit loop
    exception
      when unique_violation then
        -- Username conflict, try with a number
        v_attempts := v_attempts + 1;
        if v_attempts > 10 then
          -- Fallback to UUID-based username
          v_username := 'user_' || substr(new.id::text, 1, 8);
          insert into profiles (id, username, full_name)
          values (new.id, v_username, v_full_name)
          on conflict (id) do nothing;
          exit;
        else
          v_username := v_username || '_' || v_attempts;
        end if;
      when others then
        -- Other error, use fallback
        raise warning 'Error creating profile for user %: %', new.id, sqlerrm;
        v_username := 'user_' || substr(new.id::text, 1, 8);
        insert into profiles (id, username, full_name)
        values (new.id, v_username, v_full_name)
        on conflict (id) do update set username = excluded.username;
        exit;
    end;
  end loop;
  
  return new;
exception
  when others then
    -- Final fallback - don't fail user creation
    raise warning 'Critical error creating profile for user %: %', new.id, sqlerrm;
    begin
      insert into profiles (id, username, full_name)
      values (new.id, 'user_' || substr(new.id::text, 1, 8), v_full_name)
      on conflict (id) do nothing;
    exception
      when others then
        raise warning 'Could not create profile even with fallback: %', sqlerrm;
    end;
    return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Function to update updated_at timestamp
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger set_updated_at_profiles
  before update on profiles
  for each row execute procedure handle_updated_at();

create trigger set_updated_at_cards
  before update on cards
  for each row execute procedure handle_updated_at();

