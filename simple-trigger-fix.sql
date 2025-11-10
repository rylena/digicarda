-- SIMPLE FIX - Run this in Supabase SQL Editor
-- This creates a minimal trigger that should definitely work

-- Step 1: Drop everything
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user() cascade;

-- Step 2: Create the simplest possible trigger function
create or replace function handle_new_user()
returns trigger as $$
declare
  v_username text;
begin
  -- Get username from metadata, with multiple fallbacks
  v_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1),
    'user_' || substr(new.id::text, 1, 8)
  );
  
  -- Clean username to only allow valid characters
  v_username := lower(regexp_replace(v_username, '[^a-z0-9_]', '', 'g'));
  
  -- Final fallback if still empty
  if v_username = '' or v_username is null then
    v_username := 'user_' || substr(new.id::text, 1, 8);
  end if;
  
  -- Insert with conflict handling - this should NEVER fail
  insert into profiles (id, username, full_name)
  values (
    new.id, 
    v_username,
    nullif(trim(new.raw_user_meta_data->>'full_name'), '')
  )
  on conflict (id) do update 
    set username = excluded.username,
        full_name = coalesce(excluded.full_name, profiles.full_name);
  
  return new;
exception
  when others then
    -- If everything fails, try with a guaranteed unique username
    begin
      insert into profiles (id, username, full_name)
      values (new.id, 'user_' || substr(new.id::text, 1, 8), null)
      on conflict (id) do nothing;
    exception
      when others then
        -- Even this failed - log but don't stop user creation
        raise warning 'Profile creation failed for user %: %', new.id, sqlerrm;
    end;
    return new;
end;
$$ language plpgsql security definer;

-- Step 3: Recreate trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Step 4: Verify it was created
select 
  tgname as trigger_name,
  proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
from pg_trigger t
join pg_proc p on t.tgfoid = p.oid
where tgname = 'on_auth_user_created';

-- Step 5: Check if there are any existing conflicting profiles
select id, username from profiles where username = 'admin';

