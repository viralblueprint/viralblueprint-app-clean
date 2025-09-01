-- First, remove the existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_default_albums_for_user();

-- Drop existing policies if they exist (clean slate)
DROP POLICY IF EXISTS "Users can view own albums" ON albums;
DROP POLICY IF EXISTS "Users can create own albums" ON albums;
DROP POLICY IF EXISTS "Users can update own albums" ON albums;
DROP POLICY IF EXISTS "Users can delete own albums" ON albums;
DROP POLICY IF EXISTS "Users can view own saved videos" ON saved_videos;
DROP POLICY IF EXISTS "Users can save videos to own albums" ON saved_videos;
DROP POLICY IF EXISTS "Users can delete own saved videos" ON saved_videos;

-- Drop and recreate tables with proper structure
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

-- NOTE: Default albums will be created by the application when users sign up or log in
-- This avoids the trigger error and gives us more control