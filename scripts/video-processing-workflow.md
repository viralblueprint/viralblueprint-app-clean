# Video Processing Workflow - Handling Updates and Duplicates

## The Problem
You have videos with partial data (URL + views) and need to:
1. Add missing data (niche, hook) later
2. Prevent duplicate entries for the same video
3. Update existing videos with new view counts

## Solution: Use URL as Unique Identifier

### Step 1: Modify Database to Prevent Duplicates

Add a UNIQUE constraint on URL in Supabase SQL Editor:

```sql
-- Make URL unique to prevent duplicates
ALTER TABLE viral_content 
ADD CONSTRAINT unique_video_url UNIQUE (url);

-- Or if you want to allow same video on different dates
ALTER TABLE viral_content 
ADD CONSTRAINT unique_video_date UNIQUE (url, date_posted);
```

### Step 2: Create an UPSERT Function in Supabase

```sql
-- This function inserts new videos or updates existing ones
CREATE OR REPLACE FUNCTION upsert_viral_content(
  p_url TEXT,
  p_views BIGINT DEFAULT NULL,
  p_followers BIGINT DEFAULT NULL,
  p_niche TEXT DEFAULT NULL,
  p_hook_text TEXT DEFAULT NULL,
  p_platform TEXT DEFAULT NULL,
  p_date_posted DATE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  status TEXT
) AS $$
DECLARE
  v_id UUID;
  v_status TEXT;
  v_platform TEXT;
BEGIN
  -- Auto-detect platform from URL if not provided
  IF p_platform IS NULL THEN
    IF p_url LIKE '%tiktok.com%' THEN
      v_platform := 'tiktok';
    ELSIF p_url LIKE '%instagram.com%' THEN
      v_platform := 'instagram';
    ELSE
      v_platform := 'tiktok'; -- default
    END IF;
  ELSE
    v_platform := p_platform;
  END IF;

  -- Try to find existing video
  SELECT vc.id INTO v_id
  FROM viral_content vc
  WHERE vc.url = p_url;

  IF v_id IS NOT NULL THEN
    -- Update existing video with any new data provided
    UPDATE viral_content
    SET 
      views = COALESCE(p_views, viral_content.views),
      followers_at_time = COALESCE(p_followers, viral_content.followers_at_time),
      niche = COALESCE(p_niche, viral_content.niche),
      hook_text = COALESCE(p_hook_text, viral_content.hook_text),
      date_posted = COALESCE(p_date_posted, viral_content.date_posted)
    WHERE id = v_id;
    
    v_status := 'updated';
  ELSE
    -- Insert new video
    INSERT INTO viral_content (
      platform, url, views, followers_at_time, 
      niche, hook_text, date_posted, format_type
    )
    VALUES (
      v_platform,
      p_url,
      COALESCE(p_views, 0),
      COALESCE(p_followers, 0),
      COALESCE(p_niche, 'Uncategorized'),
      COALESCE(p_hook_text, ''),
      COALESCE(p_date_posted, CURRENT_DATE),
      'video'
    )
    RETURNING viral_content.id INTO v_id;
    
    v_status := 'created';
  END IF;

  RETURN QUERY SELECT v_id, p_url, v_status;
END;
$$ LANGUAGE plpgsql;
```

## Workflow Scenarios

### Scenario 1: Initial Insert (URL + Views Only)
```javascript
// n8n or script - First pass with basic data
const videoData = {
  url: "https://tiktok.com/@creator/video/123",
  views: 2500000
}

// Call Supabase function
const { data } = await supabase.rpc('upsert_viral_content', {
  p_url: videoData.url,
  p_views: videoData.views
})
// Result: Video created with URL and views, niche = 'Uncategorized'
```

### Scenario 2: Update with Missing Data
```javascript
// Later, add niche and hook to the same video
const updateData = {
  url: "https://tiktok.com/@creator/video/123", // Same URL
  niche: "Fitness",
  hook_text: "POV: You finally hit your PR"
}

// Call same function - it will UPDATE not INSERT
const { data } = await supabase.rpc('upsert_viral_content', {
  p_url: updateData.url,
  p_niche: updateData.niche,
  p_hook_text: updateData.hook_text
})
// Result: Existing video updated with niche and hook
```

### Scenario 3: View Count Updates
```javascript
// Even later, update view count
const refreshData = {
  url: "https://tiktok.com/@creator/video/123",
  views: 3500000 // Views increased
}

const { data } = await supabase.rpc('upsert_viral_content', {
  p_url: refreshData.url,
  p_views: refreshData.views
})
// Result: View count updated, other fields unchanged
```

## n8n Implementation

### Node 1: Webhook/Trigger
Receives video data in any state (partial or complete)

### Node 2: Function Node
```javascript
// Process incoming data
const items = [];

for (const item of $input.all()) {
  const video = item.json;
  
  // Prepare data for upsert
  items.push({
    json: {
      p_url: video.url,
      p_views: video.views || null,
      p_followers: video.followers || null,
      p_niche: video.niche || null,
      p_hook_text: video.hook_text || null,
      p_platform: video.platform || null
    }
  });
}

return items;
```

### Node 3: Supabase RPC Node
```javascript
// Configuration
Operation: Call RPC
Function Name: upsert_viral_content
Parameters: From previous node
```

## Alternative: Staging Table Approach

If you prefer to separate incomplete and complete data:

```sql
-- Create staging table for incomplete videos
CREATE TABLE IF NOT EXISTS viral_content_staging (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    views BIGINT,
    followers_at_time BIGINT,
    platform TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);

-- Move to main table when complete
CREATE OR REPLACE FUNCTION process_staged_video(
  p_url TEXT,
  p_niche TEXT,
  p_hook_text TEXT
)
RETURNS void AS $$
BEGIN
  -- Insert into main table
  INSERT INTO viral_content (
    platform, url, views, followers_at_time,
    niche, hook_text, date_posted, format_type
  )
  SELECT 
    COALESCE(platform, 'tiktok'),
    url,
    COALESCE(views, 0),
    COALESCE(followers_at_time, 0),
    p_niche,
    p_hook_text,
    CURRENT_DATE,
    'video'
  FROM viral_content_staging
  WHERE url = p_url;
  
  -- Mark as processed
  UPDATE viral_content_staging
  SET processed = TRUE
  WHERE url = p_url;
END;
$$ LANGUAGE plpgsql;
```

## Quick Node.js Script for Bulk Updates

```javascript
// scripts/update-videos.js
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function updateVideos() {
  // Your video data with various levels of completeness
  const videos = [
    { url: "url1", views: 1000000 }, // Just views
    { url: "url2", niche: "Fitness", hook_text: "POV: ..." }, // Just metadata
    { url: "url3", views: 2000000, niche: "Tech/Gaming", hook_text: "Wait for it..." } // Complete
  ]
  
  for (const video of videos) {
    const { data, error } = await supabase.rpc('upsert_viral_content', {
      p_url: video.url,
      p_views: video.views || null,
      p_niche: video.niche || null,
      p_hook_text: video.hook_text || null
    })
    
    if (error) {
      console.error(`Error with ${video.url}:`, error)
    } else {
      console.log(`✅ ${data[0].status}: ${video.url}`)
    }
  }
}

updateVideos()
```

## Best Practices

### 1. URL Normalization
Ensure URLs are consistent:
```javascript
function normalizeUrl(url) {
  // Remove tracking parameters
  const cleanUrl = url.split('?')[0]
  // Ensure https
  return cleanUrl.replace('http://', 'https://')
}
```

### 2. Batch Processing
```sql
-- Process multiple videos at once
CREATE OR REPLACE FUNCTION batch_upsert_videos(
  videos JSONB
)
RETURNS TABLE(processed INT, errors INT) AS $$
DECLARE
  v JSONB;
  processed_count INT := 0;
  error_count INT := 0;
BEGIN
  FOR v IN SELECT * FROM jsonb_array_elements(videos)
  LOOP
    BEGIN
      PERFORM upsert_viral_content(
        v->>'url',
        (v->>'views')::BIGINT,
        (v->>'followers')::BIGINT,
        v->>'niche',
        v->>'hook_text'
      );
      processed_count := processed_count + 1;
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
    END;
  END LOOP;
  
  RETURN QUERY SELECT processed_count, error_count;
END;
$$ LANGUAGE plpgsql;
```

### 3. Track Data Completeness
```sql
-- Add completeness score to viral_content
ALTER TABLE viral_content
ADD COLUMN completeness_score INT GENERATED ALWAYS AS (
  CASE 
    WHEN hook_text IS NOT NULL AND hook_text != '' THEN 40 ELSE 0 
  END +
  CASE 
    WHEN niche != 'Uncategorized' THEN 30 ELSE 0 
  END +
  CASE 
    WHEN followers_at_time > 0 THEN 20 ELSE 0 
  END +
  CASE 
    WHEN views > 0 THEN 10 ELSE 0 
  END
) STORED;

-- Find incomplete videos
SELECT url, completeness_score 
FROM viral_content 
WHERE completeness_score < 100
ORDER BY completeness_score ASC;
```

## Summary

✅ **Use URL as unique identifier** - Prevents duplicates
✅ **Use UPSERT pattern** - Insert or update based on URL
✅ **Allow partial data** - Update fields as they become available
✅ **Track completeness** - Know which videos need more data

This approach lets you:
1. Insert videos with just URL + views initially
2. Update with niche and hook later
3. Never create duplicates
4. Track view count changes over time