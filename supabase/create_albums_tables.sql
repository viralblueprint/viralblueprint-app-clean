-- Create albums table for organizing saved videos
CREATE TABLE IF NOT EXISTS albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6B46C1', -- Default purple color
    icon TEXT DEFAULT 'folder', -- Icon name for the album
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_videos table to store which videos are saved to which albums
CREATE TABLE IF NOT EXISTS saved_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    video_id UUID NOT NULL, -- References viral_videos.id
    notes TEXT, -- Optional notes about why this video was saved
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure a video can only be saved once per album
    UNIQUE(album_id, video_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_saved_videos_album_id ON saved_videos(album_id);
CREATE INDEX idx_saved_videos_video_id ON saved_videos(video_id);
CREATE INDEX idx_saved_videos_saved_at ON saved_videos(saved_at DESC);
CREATE INDEX idx_albums_created_at ON albums(created_at DESC);

-- Enable Row Level Security
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;

-- Policies for public access (adjust based on your auth needs)
CREATE POLICY "Allow public read access to albums" ON albums
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert to albums" ON albums
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update to albums" ON albums
    FOR UPDATE TO public USING (true);

CREATE POLICY "Allow public delete to albums" ON albums
    FOR DELETE TO public USING (true);

CREATE POLICY "Allow public read access to saved_videos" ON saved_videos
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert to saved_videos" ON saved_videos
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public delete from saved_videos" ON saved_videos
    FOR DELETE TO public USING (true);

-- Create default albums
INSERT INTO albums (name, description, color, icon) VALUES 
    ('Favorites', 'Your favorite viral videos', '#EF4444', 'heart'),
    ('Inspiration', 'Videos for creative inspiration', '#3B82F6', 'lightbulb'),
    ('To Study', 'Videos to analyze and learn from', '#10B981', 'book-open')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON albums TO authenticated;
GRANT SELECT, INSERT, DELETE ON saved_videos TO anon;
GRANT SELECT, INSERT, DELETE ON saved_videos TO authenticated;