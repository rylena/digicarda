-- Fix for "Database error saving new user"
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user() cascade;

-- Step 2: Create a more robust trigger function
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
  -- If username exists, append a number
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
        -- Other error, log and use fallback
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
    -- Try one more time with a guaranteed unique username
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

-- Step 3: Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Step 4: Verify the trigger exists
select 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  proname as function_name
from pg_trigger t
join pg_proc p on t.tgfoid = p.oid
where tgname = 'on_auth_user_created';

-- Step 5: Test the function (optional - uncomment to test)
-- This will show if there are any syntax errors
-- select handle_new_user();

