-- Supabase Storage Setup SQL
-- Run this in your Supabase SQL Editor: https://ocjijtyenhpuridikjyu.supabase.co/project/_/sql

-- Step 1: Create a new storage bucket
-- If you already have a bucket named 'profile-pictures', skip this step.
insert into storage.buckets (id, name, public)
values ('profile-pictures', 'profile-pictures', true)
on conflict (id) do nothing;

-- Step 2: Enable RLS on the new bucket (it should be enabled by default, but verify)
-- This is not a SQL command, but a setting in the Supabase UI:
-- Go to Storage -> Buckets -> 'profile-pictures' -> Settings -> Toggle on "Public bucket"

-- Step 3: Create policies for profile-pictures bucket
-- Allow authenticated users to upload their own profile pictures
create policy "Allow authenticated users to upload profile pictures"
  on storage.objects for insert
  with check (bucket_id = 'profile-pictures' AND auth.uid() is not null);

-- Allow authenticated users to update their own profile pictures
create policy "Allow authenticated users to update own profile pictures"
  on storage.objects for update
  using (bucket_id = 'profile-pictures' AND auth.uid() = owner);

-- Allow everyone to view profile pictures (since it's a public card)
create policy "Allow public access to profile pictures"
  on storage.objects for select
  using (bucket_id = 'profile-pictures');

-- Optional: Allow users to delete their own profile pictures
create policy "Allow authenticated users to delete own profile pictures"
  on storage.objects for delete
  using (bucket_id = 'profile-pictures' AND auth.uid() = owner);

-- Step 4: Verify policies
-- Go to Storage -> Buckets -> 'profile-pictures' -> Policies tab to confirm
