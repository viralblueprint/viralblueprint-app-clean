# n8n Setup Guide for Viralizes

## Database Structure: Use Individual Rows (Not Vector Store)

### Why Individual Rows?
- **Structured Analytics**: Filter by niche, platform, viral ratio
- **Pattern Detection**: Compare specific hook templates across videos
- **Performance Metrics**: Calculate averages, trends, success rates
- **Simple Integration**: Direct INSERT/UPDATE operations
- **Cost Effective**: No embedding API costs

### When to Consider Vector Store (Not for this project):
- Semantic similarity search across content
- Finding "videos like this one" based on meaning
- Unstructured content analysis
- Natural language queries

## n8n Workflow Options

### Option 1: Manual Entry Workflow
```javascript
// Webhook receives data from form/API
{
  "url": "https://tiktok.com/@creator/video/123",
  "views": 2500000,
  "followers": 100000,
  "hook_text": "POV: You finally hit your PR",
  "niche": "Fitness"
}

// Process and insert to viral_content table
```

### Option 2: Bulk CSV Import Workflow
1. **Read CSV** from Google Sheets/Dropbox
2. **Transform** data to match schema
3. **Batch Insert** to Supabase
4. **Update** pattern statistics

### Option 3: API Integration Workflow
```javascript
// If using TikTok/Instagram APIs (when available)
1. Fetch video metadata
2. Extract hook (first 5 seconds transcript/caption)
3. Calculate viral ratio
4. Categorize by niche
5. Insert to database
```

## Supabase Table Structure for n8n

### viral_content table
```sql
{
  "platform": "tiktok",           -- Required
  "url": "https://...",           -- Required
  "views": 2500000,               -- Required
  "followers_at_time": 100000,    -- Required
  "date_posted": "2024-03-20",    -- Required
  "niche": "Fitness",             -- Required (must match your 7 niches)
  "format_type": "video",         -- Default: "video"
  "hook_text": "...",             -- Required (first 5 seconds)
  "visual_hook_desc": "...",      -- Optional
  "verbal_hook_text": "...",      -- Optional
  "written_hook_text": "..."      -- Optional
}
```

### hook_patterns table
```sql
{
  "template": "POV: You're {situation} and {unexpected_outcome}",
  "category": "Relatable",
  "occurrence_frequency": 100,    -- How many times seen
  "avg_viral_ratio": 18.5,        -- Average performance
  "sample_size": 100,             -- Number of examples
  "confidence_level": 95.0        -- Statistical confidence
}
```

## n8n Nodes Setup

### 1. Supabase Credentials
```javascript
{
  "url": "YOUR_SUPABASE_URL",
  "serviceKey": "YOUR_SUPABASE_ANON_KEY"
}
```

### 2. Insert Video Node
```javascript
// Supabase node configuration
Operation: Create
Table: viral_content
Data: Map from your source
```

### 3. Update Pattern Stats Node
```javascript
// After inserting video, update pattern stats
Operation: Execute Query
Query: `
  UPDATE hook_patterns 
  SET sample_size = sample_size + 1,
      occurrence_frequency = occurrence_frequency + 1
  WHERE template LIKE '%' || $1 || '%'
`
```

## Data Collection Workflow

### Step 1: Collect Videos
```javascript
// Input format for n8n webhook
{
  "videos": [
    {
      "url": "https://tiktok.com/@user/video/123",
      "views": 2500000,
      "followers": 100000,
      "hook_text": "POV: You finally...",
      "niche": "Fitness"
    }
  ]
}
```

### Step 2: Process in n8n
```javascript
// Function node to process
for (const video of items) {
  // Calculate viral ratio
  video.viral_ratio = video.views / video.followers;
  
  // Categorize if needed
  if (video.viral_ratio > 15) {
    video.performance_tier = 'viral';
  }
  
  // Format date
  video.date_posted = video.date_posted || new Date().toISOString().split('T')[0];
}
```

### Step 3: Pattern Extraction (Advanced)
```javascript
// After collecting 100+ videos, extract patterns
const patterns = {};

for (const video of videos) {
  // Simple pattern detection
  if (video.hook_text.includes('POV:')) {
    patterns['POV'] = (patterns['POV'] || 0) + 1;
  }
  if (video.hook_text.includes('Wait for it')) {
    patterns['Suspense'] = (patterns['Suspense'] || 0) + 1;
  }
  // etc...
}

// Create hook_patterns entries for common patterns
```

## Automation Ideas

### 1. Daily Collection
- Schedule n8n workflow to run daily
- Fetch trending videos from each niche
- Auto-categorize and insert

### 2. Pattern Analysis
- Weekly job to analyze new videos
- Extract common patterns
- Update pattern statistics

### 3. Performance Tracking
- Track which patterns trend over time
- Alert when new pattern emerges
- Update confidence levels

## Quick Start SQL for n8n

```sql
-- Use this in n8n Supabase Execute Query node
INSERT INTO viral_content (
  platform, url, views, followers_at_time, 
  date_posted, niche, format_type, hook_text
)
VALUES (
  $1, $2, $3, $4, $5, $6, 'video', $7
)
RETURNING *;
```

## API Endpoints for n8n

Create these in Supabase if you want custom endpoints:

```sql
-- Function to insert video and update stats
CREATE OR REPLACE FUNCTION insert_viral_video(
  p_url TEXT,
  p_views BIGINT,
  p_followers BIGINT,
  p_hook TEXT,
  p_niche TEXT
)
RETURNS void AS $$
BEGIN
  -- Insert video
  INSERT INTO viral_content (
    platform, url, views, followers_at_time,
    date_posted, niche, format_type, hook_text
  )
  VALUES (
    CASE WHEN p_url LIKE '%tiktok%' THEN 'tiktok' ELSE 'instagram' END,
    p_url, p_views, p_followers,
    CURRENT_DATE, p_niche, 'video', p_hook
  );
  
  -- Update pattern stats if pattern exists
  UPDATE hook_patterns
  SET sample_size = sample_size + 1
  WHERE p_hook ILIKE '%' || SUBSTRING(template, 1, 10) || '%';
END;
$$ LANGUAGE plpgsql;
```

## Summary

✅ **Use individual rows** - Perfect for your structured viral content data
❌ **Don't use vector store** - Overkill for pattern matching and analytics
🚀 **n8n makes it easy** - Direct Supabase integration with simple INSERT operations