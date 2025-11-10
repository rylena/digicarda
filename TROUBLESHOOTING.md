# Troubleshooting Guide

## "Database error saving new user" or Signup Errors

### Step 1: Check if the trigger function exists and is correct

Run this in Supabase SQL Editor to check:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';
```

### Step 2: Update the trigger function

If the function doesn't exist or is outdated, run this SQL:

```sql
-- Fix for the handle_new_user trigger function
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
```

### Step 3: Disable Email Confirmation (for testing)

1. Go to your Supabase project: https://ocjijtyenhpuridikjyu.supabase.co
2. Navigate to **Authentication** > **Settings**
3. Under **Email Auth**, disable **"Confirm email"**
4. This allows users to sign in immediately without email confirmation

### Step 4: Check Console for Detailed Errors

After the update, check your browser console (F12) for detailed error messages. The improved error handling will show:
- The exact error message from Supabase
- Error status codes
- Full error object

### Step 5: Verify Tables Exist

Run this in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'cards');
```

Both `profiles` and `cards` should be listed.

### Step 6: Test Profile Creation Manually

If signup still fails, test if you can create a profile manually:

```sql
-- This should work if RLS is set up correctly
-- Replace 'test-user-id' with an actual user ID from auth.users
INSERT INTO profiles (id, username, full_name)
VALUES ('test-user-id', 'testuser', 'Test User');
```

## Common Issues

### Issue: "Username is already taken"
- Solution: Choose a different username
- Check existing usernames in Supabase Table Editor

### Issue: "Email already registered"
- Solution: Use a different email or try logging in instead
- Check if email confirmation is required

### Issue: Trigger not firing
- Solution: Make sure the trigger exists (see Step 1)
- Re-run the trigger creation SQL (see Step 2)

### Issue: RLS blocking inserts
- Solution: The `security definer` function should bypass RLS
- Verify the function is created with `security definer`

## Still Having Issues?

1. Check Supabase logs: Go to **Logs** > **Postgres Logs** in Supabase dashboard
2. Check browser console for detailed error messages
3. Verify your `.env.local` has the correct Supabase URL and anon key
4. Make sure you've run the complete `supabase-schema.sql` file

