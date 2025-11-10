# SterlingCards

A DIY digital card generator web app that allows users to create a personal profile card with a unique link and optional QR code.

## Features

- **Unique URL**: Each card gets a custom URL like `sterlingcards.com/username`
- **QR Code Generation**: Automatic QR code generation for each card
- **Multiple Contact Fields**: 
  - Gmail(s)
  - Phone numbers
  - WhatsApp
  - Instagram
  - Location
  - Images
- **One Card Per Account**: Each user can create only one card
- **Clean UI**: Minimal, modern card layout with smooth animations
- **Responsive Design**: Works perfectly on all devices

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Supabase** - Backend (Authentication, Database, Storage)
- **QRCode** - QR code generation

## Setup Instructions

### Prerequisites

- Node.js 20.9.0 or higher (currently using 18.20.4 - upgrade recommended)
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd digicarda
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the SQL from `supabase-schema.sql`
3. Get your Supabase URL and anon key from Project Settings > API

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, update `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://sterlingcards.com`).

### 5. Run the Development Server

**Important**: This project requires Node.js 20.9.0 or higher. If you have Node.js 18 or lower, you'll need to upgrade.

#### Option 1: Using the helper script (Recommended)
```bash
./start-dev.sh
```

#### Option 2: Manual setup with nvm
If you have nvm installed:
```bash
nvm use 20
npm run dev
```

#### Option 3: Direct command
If Node.js 20 is your default version:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: If you just installed nvm, you may need to open a new terminal or run:
```bash
source ~/.bashrc
```

## Database Schema

The app uses two main tables:

1. **profiles** - User profiles (extends auth.users)
2. **cards** - User cards (one per user)

See `supabase-schema.sql` for the complete schema definition.

## Project Structure

```
digicarda/
├── app/                    # Next.js App Router pages
│   ├── [username]/        # Public profile pages
│   ├── about/             # About Us page
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── CardDisplay.tsx    # Card display component
│   ├── DashboardContent.tsx
│   ├── LoginForm.tsx
│   ├── QRCode.tsx
│   └── SignupForm.tsx
├── lib/                   # Utility functions
│   └── supabase/          # Supabase client setup
├── types/                 # TypeScript types
└── supabase-schema.sql    # Database schema
```

## Features Breakdown

### Authentication
- User signup with username, email, and password
- User login
- Session management with Supabase Auth

### Dashboard
- Edit card information
- Real-time preview
- View card link
- Logout functionality

### Public Profile Pages
- Accessible at `/{username}`
- Display card with all contact information
- QR code for easy sharing
- Contact button to show/hide contact details
- Footer with "Create your SterlingCards" link

### QR Code
- Automatically generated for each card
- Links to the card's public URL
- Scannable for easy sharing

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## Notes

- **Node.js Version**: The project currently uses Node.js 18.20.4, but Next.js 16 requires Node.js 20.9.0+. Consider upgrading Node.js for optimal performance.
- **Email Confirmation**: Supabase may require email confirmation. Adjust this in your Supabase project settings.
- **Storage**: Profile pictures and images are currently stored via URL. You can integrate Supabase Storage for file uploads if needed.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
