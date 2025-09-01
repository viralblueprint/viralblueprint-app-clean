# ViralBlueprint App

A viral content analysis and pattern recognition platform built with Next.js, TypeScript, and Supabase.

## Features

- 📊 Viral content database with advanced filtering
- 📈 Pattern analysis and insights
- 📁 Album organization system
- 🖼️ Image proxy for Instagram/TikTok content
- 📱 Responsive design

## Tech Stack

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Icons:** Lucide React
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/viralblueprint/viralblueprint-app-clean.git
cd viralblueprint-app-clean
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see below)

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For Vercel deployment**, add these same environment variables in your Vercel project settings.

## Deployment on Vercel

### Option 1: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts and add environment variables when asked.

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes (image proxy)
│   ├── albums/         # Album pages
│   ├── dashboard/      # Dashboard page
│   ├── patterns/       # Pattern analysis
│   └── ...
├── components/         # React components
├── lib/               # Utility functions and API clients
├── types/             # TypeScript type definitions
└── public/            # Static assets
```

## API Routes

- `/api/proxy-image` - Proxies images from Instagram/TikTok to bypass CORS

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Private