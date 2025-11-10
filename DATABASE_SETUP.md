# Database Setup Instructions

## Quick Setup Steps

1. **Go to your Supabase project**: https://ocjijtyenhpuridikjyu.supabase.co
2. **Click on "SQL Editor"** in the left sidebar
3. **Click "New Query"**
4. **Copy the entire contents** of `supabase-schema.sql` file
5. **Paste it into the SQL Editor**
6. **Click "Run"** (or press Ctrl+Enter)

## What the Schema Creates

- `profiles` table - User profiles linked to auth.users
- `cards` table - User cards (one per user)
- Row Level Security (RLS) policies for data access
- Triggers for automatic profile creation and timestamp updates

## Verify Setup

After running the SQL, you can verify by:
1. Go to **Table Editor** in Supabase
2. You should see `profiles` and `cards` tables listed

## Troubleshooting

If you get errors:
- Make sure you're running the entire SQL file, not just parts
- Check that you have the correct permissions in Supabase
- The UUID extension should be enabled automatically

