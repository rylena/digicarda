# SterlingCards Setup Guide

## Step 1: Environment Variables ✅

Your `.env.local` file has been created with your Supabase credentials.

## Step 2: Set Up Database Schema

You need to run the SQL schema in your Supabase project:

1. Go to your Supabase project: https://ocjijtyenhpuridikjyu.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-schema.sql`
5. Click **Run** (or press Ctrl+Enter)

The SQL will:
- Create the `profiles` table
- Create the `cards` table
- Set up Row Level Security (RLS) policies
- Create triggers for automatic profile creation and timestamp updates

## Step 3: Configure Supabase Auth (Optional but Recommended)

1. Go to **Authentication** > **Settings** in your Supabase dashboard
2. Under **Email Auth**, you can:
   - Disable "Confirm email" if you want users to sign in immediately (for testing)
   - Or keep it enabled for production (users will need to confirm their email)

## Step 4: Run the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Step 5: Test the App

1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Create an account with:
   - A unique username
   - Your email
   - A password (minimum 6 characters)
4. You'll be redirected to the dashboard where you can edit your card
5. Your public card will be available at `http://localhost:3000/{your-username}`

## Troubleshooting

### "Username is already taken"
- Make sure you're using a unique username
- Check the `cards` table in Supabase to see existing usernames

### "Error creating card"
- Make sure the database schema has been run successfully
- Check the Supabase logs for any errors
- Verify that the trigger `on_auth_user_created` was created

### Authentication issues
- Check that email confirmation is disabled (for testing) or that you've confirmed your email
- Verify your Supabase URL and anon key in `.env.local`

### Database connection issues
- Verify your Supabase project is active
- Check that your IP is not blocked (Supabase allows all IPs by default)
- Make sure the tables exist by checking the Table Editor in Supabase

## Next Steps

Once everything is working:
1. Customize your card with contact information
2. Add profile pictures and images (use image URLs for now)
3. Share your card link with others
4. Scan the QR code to test sharing

For production deployment:
- Update `NEXT_PUBLIC_APP_URL` to your production domain
- Enable email confirmation in Supabase
- Set up proper domain for your Supabase project
- Consider adding image upload functionality using Supabase Storage

