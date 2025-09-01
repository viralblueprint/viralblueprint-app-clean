-- Fresh Schema Creation - Use this if you don't have an existing viral_videos table
-- This creates the new schema from scratch

-- Single comprehensive table for all viral video data
CREATE TABLE viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Core fields
    url TEXT UNIQUE NOT NULL,
    thumbnail TEXT, -- URL to thumbnail image (e.g., hosted on Supabase Storage, Cloudinary, etc.)
    views BIGINT NOT NULL,
    industry TEXT NOT NULL, -- 'Fitness', 'Business', 'Lifestyle', 'Tech'
    post_type TEXT NOT NULL, -- 'Before and After', 'Tutorial', etc.
    
    -- Hook categorization (the TYPE of hook used)
    visual_hook_type TEXT, -- e.g., 'Transformation', 'Text Overlay', 'Split Screen', 'POV'
    audio_hook_type TEXT,  -- e.g., 'Question', 'Story', 'Challenge', 'Trending Audio'
    written_hook_type TEXT, -- e.g., 'Curiosity Gap', 'Numbered List', 'Controversial Take'
    
    -- The actual full hook content
    hook TEXT, -- The complete opening hook text/script used in the video
    
    -- Legacy fields for backward compatibility (if you have old data)
    verbal_hook TEXT,
    visual_hook TEXT,
    written_hook TEXT,
    
    -- Video metadata
    video_created_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Basic indexes for performance
CREATE INDEX idx_videos_industry ON viral_videos(industry);
CREATE INDEX idx_videos_post_type ON viral_videos(post_type);
CREATE INDEX idx_videos_views ON viral_videos(views DESC);
CREATE INDEX idx_videos_date ON viral_videos(video_created_date);
CREATE INDEX idx_videos_visual_hook ON viral_videos(visual_hook_type);
CREATE INDEX idx_videos_audio_hook ON viral_videos(audio_hook_type);
CREATE INDEX idx_videos_written_hook ON viral_videos(written_hook_type);

-- Simple insert or update function
CREATE OR REPLACE FUNCTION upsert_video(
    p_url TEXT,
    p_views BIGINT,
    p_industry TEXT,
    p_post_type TEXT,
    p_thumbnail TEXT DEFAULT NULL,
    p_visual_hook_type TEXT DEFAULT NULL,
    p_audio_hook_type TEXT DEFAULT NULL,
    p_written_hook_type TEXT DEFAULT NULL,
    p_hook TEXT DEFAULT NULL,
    p_video_created_date DATE DEFAULT NULL
)
RETURNS TEXT AS $$
BEGIN
    -- Try to insert
    INSERT INTO viral_videos (
        url, thumbnail, views, industry, post_type, 
        visual_hook_type, audio_hook_type, written_hook_type, hook, 
        video_created_date
    )
    VALUES (
        p_url, p_thumbnail, p_views, p_industry, p_post_type, 
        p_visual_hook_type, p_audio_hook_type, p_written_hook_type, p_hook, 
        p_video_created_date
    )
    -- If URL exists, update instead
    ON CONFLICT (url) 
    DO UPDATE SET
        thumbnail = COALESCE(EXCLUDED.thumbnail, viral_videos.thumbnail),
        views = EXCLUDED.views,
        industry = EXCLUDED.industry,
        post_type = EXCLUDED.post_type,
        visual_hook_type = COALESCE(EXCLUDED.visual_hook_type, viral_videos.visual_hook_type),
        audio_hook_type = COALESCE(EXCLUDED.audio_hook_type, viral_videos.audio_hook_type),
        written_hook_type = COALESCE(EXCLUDED.written_hook_type, viral_videos.written_hook_type),
        hook = COALESCE(EXCLUDED.hook, viral_videos.hook),
        video_created_date = COALESCE(EXCLUDED.video_created_date, viral_videos.video_created_date);
    
    RETURN 'Success';
END;
$$ LANGUAGE plpgsql;

-- Test the table with sample data
INSERT INTO viral_videos (url, views, industry, post_type, visual_hook_type, audio_hook_type, written_hook_type, hook) 
VALUES (
    'https://tiktok.com/test', 
    1000000, 
    'Fitness', 
    'Before and After',
    'Split Screen',
    'Trending Audio',
    'Transformation Story',
    'POV: You finally see progress after 90 days of consistency...'
)
ON CONFLICT (url) DO NOTHING;