-- Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS saved_videos CASCADE;
DROP TABLE IF EXISTS albums CASCADE;

-- Create albums table with user ownership
CREATE TABLE albums (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6B46C1',
    icon TEXT DEFAULT 'folder',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create saved_videos table with user context
CREATE TABLE saved_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    video_id UUID NOT NULL,
    notes TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure a video can only be saved once per album per user
    UNIQUE(user_id, album_id, video_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_albums_user_id ON albums(user_id);
CREATE INDEX idx_saved_videos_user_id ON saved_videos(user_id);
CREATE INDEX idx_saved_videos_album_id ON saved_videos(album_id);
CREATE INDEX idx_saved_videos_video_id ON saved_videos(video_id);
CREATE INDEX idx_saved_videos_saved_at ON saved_videos(saved_at DESC);
CREATE INDEX idx_albums_created_at ON albums(created_at DESC);

-- Enable Row Level Security
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for albums
-- Users can only see their own albums
CREATE POLICY "Users can view own albums" ON albums
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own albums
CREATE POLICY "Users can create own albums" ON albums
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own albums
CREATE POLICY "Users can update own albums" ON albums
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own albums
CREATE POLICY "Users can delete own albums" ON albums
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for saved_videos
-- Users can only see their own saved videos
CREATE POLICY "Users can view own saved videos" ON saved_videos
    FOR SELECT USING (auth.uid() = user_id);

-- Users can save videos to their own albums
CREATE POLICY "Users can save videos to own albums" ON saved_videos
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM albums 
            WHERE albums.id = album_id 
            AND albums.user_id = auth.uid()
        )
    );

-- Users can delete their own saved videos
CREATE POLICY "Users can delete own saved videos" ON saved_videos
    FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically create default albums for new users
CREATE OR REPLACE FUNCTION create_default_albums_for_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create default albums for the new user
    INSERT INTO albums (user_id, name, description, color, icon) VALUES
        (NEW.id, 'Favorites', 'Your favorite viral videos', '#EF4444', 'heart'),
        (NEW.id, 'Inspiration', 'Videos for creative inspiration', '#3B82F6', 'lightbulb'),
        (NEW.id, 'To Study', 'Videos to analyze and learn from', '#10B981', 'book-open');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create default albums when a user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_albums_for_user();