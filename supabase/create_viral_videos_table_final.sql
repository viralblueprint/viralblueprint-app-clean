-- Drop the existing table if it exists (be careful with this in production!)
DROP TABLE IF EXISTS viral_videos CASCADE;

-- Create the viral_videos table with the updated schema
CREATE TABLE viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inputurl TEXT,
    url TEXT,
    likescount INTEGER DEFAULT 0,
    videoplaycount BIGINT DEFAULT 0,
    videoviewcount BIGINT DEFAULT 0,
    videoduration DECIMAL(10,2),
    timestamp TIMESTAMPTZ,
    commentscount INTEGER DEFAULT 0,
    displayurl TEXT,
    industry TEXT,
    format TEXT,
    hooktype TEXT,
    dateinserted TIMESTAMPTZ DEFAULT NOW(),
    followers BIGINT DEFAULT 0,
    
    -- Add timestamps for tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for commonly queried columns
CREATE INDEX idx_viral_videos_industry ON viral_videos(industry);
CREATE INDEX idx_viral_videos_format ON viral_videos(format);
CREATE INDEX idx_viral_videos_hooktype ON viral_videos(hooktype);
CREATE INDEX idx_viral_videos_videoplaycount ON viral_videos(videoplaycount DESC);
CREATE INDEX idx_viral_videos_timestamp ON viral_videos(timestamp DESC);
CREATE INDEX idx_viral_videos_dateinserted ON viral_videos(dateinserted DESC);

-- Create text indexes for search functionality
CREATE INDEX idx_viral_videos_inputurl_text ON viral_videos(inputurl);
CREATE INDEX idx_viral_videos_hooktype_text ON viral_videos(hooktype);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE viral_videos ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all users to read data
CREATE POLICY "Allow public read access" ON viral_videos
    FOR SELECT
    TO public
    USING (true);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_viral_videos_updated_at
    BEFORE UPDATE ON viral_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT ON viral_videos TO anon;
GRANT SELECT ON viral_videos TO authenticated;