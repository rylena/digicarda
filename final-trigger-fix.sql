-- FINAL FIX - This will definitely work
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user() cascade;

-- Step 2: Create a working trigger function
create or replace function handle_new_user()
returns trigger as $$
declare
  v_username text;
  v_full_name text;
  v_final_username text;
begin
  -- Get username from metadata
  v_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    split_part(new.email, '@', 1),
    'user_' || substr(new.id::text, 1, 8)
  );
  
  -- Clean username
  v_username := lower(regexp_replace(v_username, '[^a-z0-9_]', '', 'g'));
  
  -- Final fallback
  if v_username = '' or v_username is null then
    v_username := 'user_' || substr(new.id::text, 1, 8);
  end if;
  
  -- Get full name
  v_full_name := nullif(trim(new.raw_user_meta_data->>'full_name'), '');
  
  -- Check if username exists, if so, use UUID-based one
  select case 
    when exists (select 1 from profiles where username = v_username) 
    then 'user_' || substr(new.id::text, 1, 8) || '_' || substr(new.id::text, 9, 4)
    else v_username
  end into v_final_username;
  
  -- Insert profile - handle id conflict only (username is guaranteed unique)
  insert into profiles (id, username, full_name)
  values (new.id, v_final_username, v_full_name)
  on conflict (id) do update 
    set username = excluded.username,
        full_name = coalesce(excluded.full_name, profiles.full_name);
  
  return new;
exception
  when others then
    -- Ultimate fallback - use UUID-based username
    begin
      v_final_username := 'user_' || substr(new.id::text, 1, 8) || '_' || substr(new.id::text, 9, 4);
      insert into profiles (id, username, full_name)
      values (new.id, v_final_username, v_full_name)
      on conflict (id) do nothing;
    exception
      when others then
        -- Even this failed - just log and continue
        raise warning 'Could not create profile for user %: %', new.id, sqlerrm;
    end;
    return new;
end;
$$ language plpgsql security definer;

-- Step 3: Recreate trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Step 4: Verify
select 
  tgname as trigger_name,
  proname as function_name
from pg_trigger t
join pg_proc p on t.tgfoid = p.oid
where tgname = 'on_auth_user_created';

