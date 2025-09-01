-- Drop existing table if it exists
DROP TABLE IF EXISTS viral_videos CASCADE;

-- Create viral videos table with scraper data fields
CREATE TABLE viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- URLs
    input_url TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    thumbnail TEXT,
    
    -- Metrics
    likes_count INTEGER,
    video_play_count INTEGER,
    video_view_count INTEGER,
    comments_count INTEGER,
    video_duration INTEGER,
    
    -- Categorization
    industry TEXT NOT NULL,
    post_type TEXT,
    
    -- Hooks
    hook TEXT NOT NULL,
    visual_hook_type TEXT,
    audio_hook_type TEXT,
    written_hook_type TEXT,
    
    -- Timestamps
    timestamp TIMESTAMPTZ,
    date_inserted TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_viral_videos_url ON viral_videos(url);
CREATE INDEX idx_viral_videos_industry ON viral_videos(industry);
CREATE INDEX idx_viral_videos_date_inserted ON viral_videos(date_inserted DESC);

-- Enable RLS
ALTER TABLE viral_videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON viral_videos FOR SELECT USING (true);