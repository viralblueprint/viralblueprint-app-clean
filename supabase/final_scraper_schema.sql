-- Drop existing table if it exists
DROP TABLE IF EXISTS viral_videos CASCADE;

-- Create viral videos table with exact field names from scraper
CREATE TABLE viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- URLs
    inputUrl TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    thumbnail TEXT,
    displayUrl TEXT,
    
    -- Metrics
    likesCount INTEGER,
    videoPlayCount INTEGER,
    videoViewCount INTEGER,
    commentsCount INTEGER,
    videoDuration DECIMAL(10, 2),
    followers INTEGER,
    
    -- Categorization
    industry TEXT NOT NULL,
    postType TEXT,
    
    -- Hooks
    hook TEXT NOT NULL,
    visualHookType TEXT,
    audioHookType TEXT,
    writtenHookType TEXT,
    
    -- Timestamps
    timestamp TIMESTAMPTZ,
    dateInserted TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_viral_videos_url ON viral_videos(url);
CREATE INDEX idx_viral_videos_industry ON viral_videos(industry);
CREATE INDEX idx_viral_videos_dateInserted ON viral_videos(dateInserted DESC);

-- Enable RLS
ALTER TABLE viral_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON viral_videos FOR SELECT USING (true);