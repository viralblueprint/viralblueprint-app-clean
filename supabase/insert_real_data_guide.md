# Guide to Inserting Real Data into Viralizes

## Option 1: Direct SQL Insertion (Quickest for Bulk Data)

### For Adding New Hook Patterns:
```sql
-- Insert a single new hook pattern
INSERT INTO hook_patterns (template, category, occurrence_frequency, avg_viral_ratio, sample_size, confidence_level) 
VALUES 
('Your new hook template here', 'Category', 100, 15.5, 100, 95.0);

-- Insert multiple hook patterns at once
INSERT INTO hook_patterns (template, category, occurrence_frequency, avg_viral_ratio, sample_size, confidence_level) 
VALUES 
('First template', 'Relatable', 500, 18.5, 500, 96.0),
('Second template', 'Humor', 300, 14.2, 300, 93.0),
('Third template', 'Educational', 200, 16.8, 200, 94.5);
```

### For Adding Viral Content Examples:
```sql
-- Insert real viral content examples
INSERT INTO viral_content (platform, url, views, followers_at_time, date_posted, niche, format_type, hook_text, visual_hook_desc, verbal_hook_text, written_hook_text) 
VALUES 
(
    'tiktok', 
    'https://actual-tiktok-url-here', 
    5000000,  -- actual view count
    250000,   -- creator's follower count when posted
    '2024-03-20', 
    'Fitness',  -- Must match one of your 7 niches
    'video', 
    'The actual hook text used in the video',
    'Description of visual elements',
    'What was said verbally', 
    'Any text overlays'
);
```

## Option 2: CSV Import (Best for Spreadsheet Data)

### Step 1: Create CSV files with your data

**hook_patterns.csv:**
```csv
template,category,occurrence_frequency,avg_viral_ratio,sample_size,confidence_level
"POV: Your specific template",Relatable,1000,17.5,1000,95.0
"Another template here",Humor,800,15.3,800,93.5
```

**viral_content.csv:**
```csv
platform,url,views,followers_at_time,date_posted,niche,format_type,hook_text
tiktok,https://real-url,3500000,150000,2024-03-20,Fitness,video,"Actual hook text"
instagram,https://real-url,2100000,85000,2024-03-19,Beauty/Skincare,video,"Another hook"
```

### Step 2: Import via Supabase Dashboard
1. Go to Table Editor in Supabase
2. Select the table (e.g., hook_patterns)
3. Click "Import data from CSV"
4. Upload your CSV file
5. Map columns and import

## Option 3: Create an Admin Panel (For Ongoing Updates)

I can create a simple admin interface for you. Would you like me to build:

### A. Simple Admin Page (`/admin`)
```tsx
// Features:
- Form to add new hook patterns
- Form to add viral content examples
- Edit existing patterns
- View all data in tables
- Delete functionality
```

### B. Bulk Import Page
```tsx
// Features:
- Paste multiple URLs
- Auto-fetch video data (if using APIs)
- Batch process and insert
- Review before saving
```

## Option 4: Data Collection Script

### For TikTok/Instagram Data Collection:
```javascript
// Example structure for a data collection script
const collectData = {
  platform: 'tiktok',
  url: 'paste_url_here',
  views: 0, // You'll need to manually check these
  followers_at_time: 0,
  date_posted: '2024-03-20',
  niche: 'Fitness', // Categorize manually
  format_type: 'video',
  hook_text: 'Copy the actual hook used',
  visual_hook_desc: 'Describe key visual elements',
  verbal_hook_text: 'Transcribe spoken hook',
  written_hook_text: 'Copy any text overlays'
};

// Then convert to SQL INSERT statement
```

## Option 5: Integration with APIs (Advanced)

### Potential Integrations:
1. **TikTok Creative Center API** - Get trending content data
2. **Instagram Basic Display API** - Fetch reel performance
3. **YouTube Data API** - Get Shorts analytics
4. **Social media scraping tools** (be careful with TOS)

## Data You Should Collect for Each Viral Video:

### Essential Fields:
- **URL**: The actual video URL
- **Views**: Exact view count
- **Followers**: Creator's follower count when posted
- **Date**: When it was posted
- **Niche**: Which of your 7 industries it belongs to
- **Hook Text**: The exact hook used (first 3-5 seconds)

### For Better Analysis:
- **Engagement Rate**: (Likes + Comments + Shares) / Views
- **Watch Time**: Average % watched (if available)
- **Share Rate**: How often it was shared
- **Save Rate**: How often it was saved
- **Comment Sentiment**: Positive/Negative/Neutral

### For Pattern Extraction:
- **Hook Type**: Which template pattern it follows
- **Visual Style**: Quick cuts, steady shot, text-heavy, etc.
- **Audio Type**: Original sound, trending audio, voiceover
- **Caption Strategy**: Long-form, minimal, CTA-focused

## Quick SQL Templates for Common Inserts:

### Add a newly discovered viral pattern:
```sql
INSERT INTO hook_patterns (template, category, occurrence_frequency, avg_viral_ratio, sample_size, confidence_level)
VALUES (
    'Replace with exact pattern template using {variables}',
    'Choose: Relatable/Humor/Educational/Tutorial/Opinion/etc',
    1,  -- Start with 1, will increment as you find more examples
    0,  -- Will calculate once you have examples
    1,  -- Number of examples found
    0   -- Will increase with more data
);
```

### Add a viral video you found:
```sql
INSERT INTO viral_content (
    platform, url, views, followers_at_time, date_posted, 
    niche, format_type, hook_text, visual_hook_desc
)
VALUES (
    'tiktok',  -- or 'instagram'
    'https://www.tiktok.com/@username/video/1234567890',
    2500000,   -- Check current views
    50000,     -- Check creator's followers
    '2024-03-20',
    'Fitness', -- or other niche
    'video',
    'Exact hook text from first 5 seconds',
    'Quick description of visuals'
);
```

### Link a video to a pattern:
```sql
-- First, find the pattern ID
SELECT id, template FROM hook_patterns WHERE template LIKE '%POV%';

-- Then update the video with pattern reference (if you add a pattern_id column)
-- Or increment the pattern's statistics
UPDATE hook_patterns 
SET sample_size = sample_size + 1,
    occurrence_frequency = occurrence_frequency + 1
WHERE id = 'pattern-uuid-here';
```

## Recommended Workflow:

1. **Start with 10-20 real examples per niche**
   - Find actual viral videos in each industry
   - Document their exact hooks
   - Note their performance metrics

2. **Identify patterns from your examples**
   - Group similar hooks together
   - Extract the template structure
   - Create pattern entries

3. **Build your database gradually**
   - Add 5-10 new examples daily
   - Update pattern statistics weekly
   - Track which patterns perform best

4. **Use a spreadsheet first**
   - Collect data in Google Sheets
   - Categorize and clean it
   - Bulk import when ready

Would you like me to:
1. Create an admin interface for easy data entry?
2. Build a URL parser that helps extract data from TikTok/Instagram links?
3. Set up a Google Sheets template for data collection?
4. Create SQL scripts for specific data import scenarios?