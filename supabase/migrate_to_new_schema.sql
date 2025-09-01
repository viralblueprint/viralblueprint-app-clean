-- Migration script from old schema to new schema
-- This preserves existing data while restructuring the table

-- First, rename the old table to keep data safe
ALTER TABLE viral_videos RENAME TO viral_videos_old;

-- Create the new table structure
CREATE TABLE viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Core fields
    url TEXT UNIQUE NOT NULL,
    thumbnail TEXT,
    views BIGINT NOT NULL,
    industry TEXT NOT NULL,
    post_type TEXT NOT NULL,
    
    -- Hook categorization (types)
    visual_hook_type TEXT,
    audio_hook_type TEXT,
    written_hook_type TEXT,
    
    -- The actual full hook content
    hook TEXT,
    
    -- Video metadata
    video_created_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_videos_industry ON viral_videos(industry);
CREATE INDEX idx_videos_post_type ON viral_videos(post_type);
CREATE INDEX idx_videos_views ON viral_videos(views DESC);
CREATE INDEX idx_videos_date ON viral_videos(video_created_date);
CREATE INDEX idx_videos_visual_hook ON viral_videos(visual_hook_type);
CREATE INDEX idx_videos_audio_hook ON viral_videos(audio_hook_type);
CREATE INDEX idx_videos_written_hook ON viral_videos(written_hook_type);

-- Migrate data from old table to new table
INSERT INTO viral_videos (
    id,
    url,
    views,
    industry,
    post_type,
    hook, -- Combine old hook fields into the main hook field
    video_created_date,
    created_at
)
SELECT 
    id,
    url,
    views,
    industry,
    post_type,
    COALESCE(verbal_hook, written_hook, visual_hook), -- Use whichever hook text exists
    video_created_date,
    created_at
FROM viral_videos_old;

-- You can now manually update the hook types based on your analysis
-- For example:
-- UPDATE viral_videos SET visual_hook_type = 'Split Screen' WHERE hook LIKE '%before%after%';
-- UPDATE viral_videos SET audio_hook_type = 'Trending Audio' WHERE url LIKE '%tiktok%';
-- UPDATE viral_videos SET written_hook_type = 'Transformation Story' WHERE post_type = 'Before and After';

-- Once you're satisfied with the migration, you can drop the old table
-- DROP TABLE viral_videos_old;

-- Create the upsert function for the new schema
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