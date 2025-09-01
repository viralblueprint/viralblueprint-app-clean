# Viralizes Platform - Setup Instructions

## Phase 1 MVP Complete ✅

The core functionality for Phase 1 has been implemented. Here's how to get started:

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)

## Setup Steps

### 1. Install Dependencies

```bash
cd viralizes-app
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to Settings > API in your Supabase dashboard
3. Copy your project URL and anon key
4. Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

5. Edit `.env.local` and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and run the SQL from `supabase/schema.sql`
3. Then copy and run the seed data from `supabase/seed.sql`

### 4. Run the Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see the application.

## Features Implemented

### ✅ Phase 1 MVP (Complete)

- **Homepage**: Trending patterns display with workflow navigation
- **Pattern Discovery**: Browse and filter viral patterns
  - Search functionality
  - Category filtering
  - Viral ratio thresholds
  - Sort options
- **Pattern Analysis**: Individual pattern pages with:
  - Statistical performance data
  - Template variables
  - Performance over time
  - Similar patterns
- **Template Generator**: Convert patterns to customized templates
  - Variable customization
  - Auto-fill examples
  - Copy and download functionality
- **Database Schema**: Supabase integration with:
  - Viral content table
  - Hook patterns table
  - Niches table
  - Pattern performance tracking

## Project Structure

```
viralizes-app/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── patterns/          # Pattern discovery
│   │   ├── page.tsx       # Browse patterns
│   │   └── [id]/          # Individual pattern pages
│   ├── templates/         # Template generator
│   └── analyze/           # Analysis tools (placeholder)
├── components/            # React components
│   ├── Navigation.tsx     # Main navigation
│   ├── PatternCard.tsx    # Pattern display card
│   └── WorkflowSection.tsx # Homepage workflow
├── lib/                   # Utilities
│   ├── api.ts            # Data fetching functions
│   └── supabase.ts       # Supabase client
└── supabase/             # Database files
    ├── schema.sql        # Table definitions
    └── seed.sql          # Sample data
```

## Next Steps (Phase 2)

- Implement advanced filtering and search
- Add pattern comparison tools
- Create statistical significance indicators
- Build performance visualizations
- Add export functionality
- Set up content ingestion pipeline

## Development Notes

- The app uses Next.js 14+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Supabase for backend services
- No authentication required (Phase 1)

## Testing

To verify everything is working:

1. Homepage should display trending patterns
2. Pattern discovery page should allow filtering
3. Clicking on patterns should show detailed analysis
4. Template generator should create customized content
5. All data should load from Supabase

## Troubleshooting

If patterns don't load:
- Check your Supabase credentials in `.env.local`
- Ensure the database tables are created
- Verify Row Level Security policies are enabled
- Check browser console for errors

## Support

For issues or questions, refer to the plan.md file for detailed specifications.