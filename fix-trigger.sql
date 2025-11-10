-- Fix for the handle_new_user trigger function
-- Run this in Supabase SQL Editor if you're getting "Database error saving new user"

-- Drop and recreate the function with better error handling
drop function if exists handle_new_user() cascade;

create or replace function handle_new_user()
returns trigger as $$
declare
  v_username text;
  v_full_name text;
begin
  -- Extract username and full_name from metadata
  v_username := new.raw_user_meta_data->>'username';
  v_full_name := new.raw_user_meta_data->>'full_name';
  
  -- Ensure username is not null (use email prefix as fallback)
  if v_username is null or v_username = '' then
    v_username := split_part(new.email, '@', 1);
  end if;
  
  -- Insert profile (security definer bypasses RLS)
  insert into profiles (id, username, full_name)
  values (new.id, v_username, v_full_name)
  on conflict (id) do nothing;
  
  return new;
exception
  when others then
    -- Log error but don't fail user creation
    raise warning 'Error creating profile for user %: %', new.id, sqlerrm;
    return new;
end;
$$ language plpgsql security definer;

-- Recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

