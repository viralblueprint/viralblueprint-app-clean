# Supabase Database Setup for Scraper Data

## Quick Setup Steps

### 1. Create New Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Name it something like "viralizes-scraper"
4. Save your database password securely
5. Wait for project to initialize

### 2. Run the Schema
1. Go to SQL Editor in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the entire contents of `supabase/scraper_schema.sql`
4. Click "Run" to create all tables and views

### 3. Get Your API Keys
1. Go to Settings → API in your Supabase dashboard
2. Copy:
   - Project URL (looks like: `https://xxxx.supabase.co`)
   - Anon Public Key (safe for client-side)
   - Service Role Key (keep secret, for server-side only)

### 4. Update Environment Variables
Create `.env.local` in the `viralizes-app` folder:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema Overview

### Main Table: `viral_videos`
Stores all your scraped video data with these columns:

| Column | Type | Description |
|--------|------|-------------|
| **input_url** | TEXT | Creator's profile URL |
| **url** | TEXT | Direct video URL (unique) |
| **thumbnail** | TEXT | Thumbnail image URL |
| **likes_count** | INTEGER | Number of likes |
| **video_play_count** | INTEGER | Total plays (Instagram metric) |
| **video_view_count** | INTEGER | Unique viewers |
| **comments_count** | INTEGER | Number of comments |
| **video_duration** | INTEGER | Duration in seconds |
| **industry** | TEXT | Content niche/category |
| **post_type** | TEXT | Reel, Story, Post, etc. |
| **hook** | TEXT | The hook text/description |
| **visual_hook_type** | TEXT | Visual hook category |
| **audio_hook_type** | TEXT | Audio hook category |
| **written_hook_type** | TEXT | Caption hook category |
| **platform** | TEXT | Auto-detected from URL |
| **timestamp** | TIMESTAMPTZ | When video was posted |
| **date_inserted** | TIMESTAMPTZ | When you scraped it |
| **engagement_rate** | DECIMAL | Auto-calculated |
| **viral_score** | DECIMAL | Auto-calculated |

### Computed Metrics
The database automatically calculates:
- **Platform**: Detected from URL (instagram, tiktok, youtube, etc.)
- **Engagement Rate**: (likes + comments) / plays * 100
- **Viral Score**: Weighted score based on engagement

### Helper Views
- **trending_content**: Videos with >1000 plays, ranked by viral score
- **hook_effectiveness**: Aggregated hook performance metrics
- **platform_metrics**: Platform-specific statistics (materialized view)

## Inserting Data

### Using Python Script
```python
# Set environment variables
export SUPABASE_URL="your-project-url"
export SUPABASE_ANON_KEY="your-anon-key"

# Run the script
python scripts/insert_scraped_data.py
```

### Direct SQL Insert
```sql
INSERT INTO viral_videos (
    input_url, url, likes_count, video_play_count, 
    video_view_count, comments_count, industry, hook
) VALUES (
    'https://instagram.com/creator',
    'https://instagram.com/reel/ABC123',
    50000, 1200000, 980000, 3500,
    'Fitness',
    'POV: You start working out for 30 days'
);
```

### Using Supabase JS Client
```javascript
const { data, error } = await supabase
  .from('viral_videos')
  .insert({
    input_url: 'https://instagram.com/creator',
    url: 'https://instagram.com/reel/ABC123',
    likes_count: 50000,
    video_play_count: 1200000,
    video_view_count: 980000,
    comments_count: 3500,
    industry: 'Fitness',
    hook: 'POV: You start working out'
  })
```

## Data Format for Bulk Import

### JSON Format
```json
[
  {
    "inputUrl": "https://www.instagram.com/creator1",
    "url": "https://www.instagram.com/reel/ABC123",
    "likesCount": 50000,
    "videoPlayCount": 1200000,
    "videoViewCount": 980000,
    "videoDuration": 30,
    "timestamp": "2024-01-15T10:30:00Z",
    "commentsCount": 3500,
    "industry": "Fitness",
    "thumbnail": "https://example.com/thumb.jpg",
    "postType": "Reel",
    "hook": "POV: You start working out",
    "visualHookType": "Before/After",
    "audioHookType": "Trending Audio",
    "writtenHookType": "POV Format"
  }
]
```

### CSV Format
```csv
inputUrl,url,likesCount,videoPlayCount,videoViewCount,videoDuration,timestamp,commentsCount,industry,postType,hook,visualHookType,audioHookType,writtenHookType
https://www.instagram.com/creator1,https://www.instagram.com/reel/ABC123,50000,1200000,980000,30,2024-01-15T10:30:00Z,3500,Fitness,Reel,POV: You start working out,Before/After,Trending Audio,POV Format
```

## Querying Your Data

### Find Top Performing Videos
```sql
SELECT * FROM viral_videos 
ORDER BY viral_score DESC 
LIMIT 10;
```

### Get Platform Statistics
```sql
SELECT * FROM platform_metrics 
WHERE platform = 'instagram';
```

### Find Best Hooks by Industry
```sql
SELECT * FROM hook_effectiveness 
WHERE usage_count >= 5 
ORDER BY avg_viral_score DESC;
```

### Trending Content This Week
```sql
SELECT * FROM trending_content 
WHERE recency_category = 'This Week' 
AND industry_rank <= 10;
```

## Maintenance

### Refresh Materialized Views
Run periodically to update platform metrics:
```sql
SELECT refresh_platform_metrics();
```

### Check Data Quality
```sql
-- Videos missing hooks
SELECT COUNT(*) FROM viral_videos WHERE hook IS NULL OR hook = '';

-- Videos with no engagement data
SELECT COUNT(*) FROM viral_videos 
WHERE likes_count = 0 AND comments_count = 0;

-- Duplicate URLs
SELECT url, COUNT(*) as count 
FROM viral_videos 
GROUP BY url 
HAVING COUNT(*) > 1;
```

## Tips

1. **Batch Inserts**: Use batch inserts for better performance when adding multiple videos
2. **Unique URLs**: The database enforces unique video URLs to prevent duplicates
3. **Auto-calculated Fields**: Don't insert platform, engagement_rate, or viral_score - they're computed automatically
4. **Industries**: New industries are automatically added to the industries table
5. **Timestamps**: Use ISO 8601 format for timestamps (e.g., "2024-01-15T10:30:00Z")

## Troubleshooting

### Common Issues

1. **Duplicate URL Error**: The URL already exists in the database
   - Solution: Use upsert or check before inserting

2. **Missing Required Fields**: input_url, url, industry, and hook are required
   - Solution: Ensure all required fields are provided

3. **Invalid Timestamp Format**: 
   - Solution: Use ISO 8601 format or let database use current time

4. **Permission Denied**: 
   - Solution: Check your API keys and RLS policies