# Excel to Supabase Import Guide

## Your Excel Structure → Database Structure

**You only need ONE table!** Your Excel columns map directly:

| Excel Column | Database Column | Type | Notes |
|-------------|-----------------|------|-------|
| URL | url | TEXT | Unique identifier (no duplicates) |
| Views | views | BIGINT | Video view count |
| Niche | niche | TEXT | Fitness, Business, etc. |
| Visual Hook | visual_hook | TEXT | What you see |
| Verbal Hook | verbal_hook | TEXT | What you hear |
| Written Hook | written_hook | TEXT | What you read |
| Created Date | video_created_date | DATE | When posted on platform |
| (Auto) | platform | TEXT | Auto-detected from URL |

## Step 1: Prepare Your Excel File

### Required Columns (exact names):
```
url, views, niche, visual_hook, verbal_hook, written_hook, video_created_date
```

### Excel Format Example:
| url | views | niche | visual_hook | verbal_hook | written_hook | video_created_date |
|-----|-------|-------|-------------|-------------|--------------|-------------------|
| https://tiktok.com/@user/video/123 | 2500000 | Fitness | Quick cuts | POV: First gym day | DAY 1 OF 75 | 2024-03-15 |

### Excel Tips:
- Date format: YYYY-MM-DD (2024-03-15)
- Niche: Must be consistent (Fitness, Business/Finance, Lifestyle, Beauty/Skincare, Food/Cooking, Fashion, Tech/Gaming)
- Leave hooks blank if unknown (you can update later)

## Step 2: Export Excel to CSV

1. In Excel: File → Save As → CSV UTF-8 (Comma delimited)
2. Make sure first row has column headers
3. Save as `viral_videos.csv`

## Step 3: Import to Supabase

### Option A: Supabase Dashboard (Easiest)
1. Go to Supabase Table Editor
2. Click on `viral_videos` table
3. Click "Import data from CSV"
4. Upload your CSV file
5. Map columns (should auto-match)
6. Import

### Option B: Using Script
```javascript
// scripts/csv-import.js
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const results = [];

fs.createReadStream('viral_videos.csv')
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    // Clean data
    const cleaned = results.map(row => ({
      url: row.url,
      views: parseInt(row.views),
      niche: row.niche,
      visual_hook: row.visual_hook || null,
      verbal_hook: row.verbal_hook || null,
      written_hook: row.written_hook || null,
      video_created_date: row.video_created_date || null
    }));
    
    // Batch insert
    const { data, error } = await supabase
      .from('viral_videos')
      .upsert(cleaned, { onConflict: 'url' });
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log(`✅ Imported ${cleaned.length} videos`);
    }
  });
```

### Option C: Direct SQL Import
```sql
-- If you have CSV data ready, create a temp table
CREATE TEMP TABLE temp_import (
    url TEXT,
    views TEXT,
    niche TEXT,
    visual_hook TEXT,
    verbal_hook TEXT,
    written_hook TEXT,
    video_created_date TEXT
);

-- Copy CSV data (in Supabase SQL editor, paste CSV content)
COPY temp_import FROM stdin WITH CSV HEADER;
url,views,niche,visual_hook,verbal_hook,written_hook,video_created_date
https://tiktok.com/@user/video/1,2500000,Fitness,Quick cuts,POV: Gym day,DAY 1,2024-03-15
https://instagram.com/reel/abc,1800000,Beauty,Close-up,Glass skin reveal,GLOW UP,2024-03-14
\.

-- Insert into main table
INSERT INTO viral_videos (url, views, niche, visual_hook, verbal_hook, written_hook, video_created_date)
SELECT 
    url,
    views::BIGINT,
    niche,
    NULLIF(visual_hook, ''),
    NULLIF(verbal_hook, ''),
    NULLIF(written_hook, ''),
    video_created_date::DATE
FROM temp_import
ON CONFLICT (url) DO UPDATE SET
    views = EXCLUDED.views,
    niche = EXCLUDED.niche,
    visual_hook = COALESCE(EXCLUDED.visual_hook, viral_videos.visual_hook),
    verbal_hook = COALESCE(EXCLUDED.verbal_hook, viral_videos.verbal_hook),
    written_hook = COALESCE(EXCLUDED.written_hook, viral_videos.written_hook),
    video_created_date = COALESCE(EXCLUDED.video_created_date, viral_videos.video_created_date);
```

## Step 4: Verify Import

Run these queries to check your data:

```sql
-- Count imported videos
SELECT COUNT(*) FROM viral_videos;

-- Check niches
SELECT niche, COUNT(*) as count 
FROM viral_videos 
GROUP BY niche;

-- Find most viewed
SELECT url, views, niche 
FROM viral_videos 
ORDER BY views DESC 
LIMIT 10;

-- Check hooks were imported
SELECT 
    COUNT(*) as total_videos,
    COUNT(visual_hook) as has_visual,
    COUNT(verbal_hook) as has_verbal,
    COUNT(written_hook) as has_written
FROM viral_videos;
```

## Excel Template

Create your Excel with these headers:
```
url | views | niche | visual_hook | verbal_hook | written_hook | video_created_date
```

### Sample Data:
```csv
url,views,niche,visual_hook,verbal_hook,written_hook,video_created_date
https://tiktok.com/@fitguru/video/1,5200000,Fitness,Before/after shots,POV: You hit your PR,DAY 47 OF 75 HARD,2024-03-15
https://instagram.com/reel/fitness1,3100000,Fitness,Transformation montage,Nobody asked but here's how I lost 30lbs,Wait for it...,2024-03-14
https://tiktok.com/@entrepreneur/video/1,8900000,Business/Finance,Screen recording,How I made $10k in 30 days,$0 to $10k,2024-03-13
```

## Benefits of One Table:

✅ **Simple** - Just one CSV import
✅ **No Joins** - All data in one place
✅ **URL = ID** - No duplicates
✅ **Easy Updates** - Re-import updates existing
✅ **Hook Counts** - Calculated automatically via views

The hook frequency/patterns are calculated on-the-fly using SQL views, so you don't need a second table!