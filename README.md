# AI Image Generator

A modern web application for generating AI images with user authentication and a credit-based system.

## Features

- 🔐 User Authentication (Sign up/Login)
- 🎨 AI Image Generation
- 💳 Credit System (1 image = 1 credit)
- 🎁 20 Free Credits on Sign Up
- 📱 Responsive Design
- 🌙 Dark Mode Support
- 🖼️ Image Gallery

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
AI_API_KEY=your_nanobanana_api_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## How It Works

### Authentication
- Users can sign up with email and password
- New users receive 20 free credits
- Secure authentication powered by Supabase

### Credit System
- Each image generation costs 1 credit
- Credits are deducted automatically
- Users can view their credit balance in the dashboard

### Image Generation
- Enter a text prompt describing the desired image
- Click "Generate Image" to create the image
- Generated images are saved to your gallery

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Nanobanana AI (configurable)

## Database Schema

### user_profiles
- `id`: UUID (primary key, references auth.users)
- `email`: TEXT
- `credits`: INTEGER (default: 20)
- `created_at`: TIMESTAMP

### generated_images
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key)
- `prompt`: TEXT
- `image_url`: TEXT
- `created_at`: TIMESTAMP

## Deployment

Deploy to Vercel:

```bash
vercel deploy --prod
```

Make sure to add your environment variables in the Vercel dashboard.

## Notes

- The current implementation uses a placeholder image service for demo purposes
- To use the actual Nanobanana AI API, uncomment and configure the API call in `app/api/generate/route.ts`
- Add your Nanobanana API key to the `.env.local` file

## License

MIT
