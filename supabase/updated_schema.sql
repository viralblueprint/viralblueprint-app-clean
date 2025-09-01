-- Updated Schema with Industry and Post Type fields
-- Replaces niche with industry and adds post_type

-- Drop old tables if starting fresh (BE CAREFUL - this deletes all data!)
DROP TABLE IF EXISTS viral_videos CASCADE;

-- Single simple table for all viral video data
CREATE TABLE viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Your essential fields with updates
    url TEXT UNIQUE NOT NULL,
    views BIGINT NOT NULL,
    industry TEXT NOT NULL, -- Changed from niche to industry
    post_type TEXT NOT NULL, -- New field for post type
    visual_hook TEXT,
    verbal_hook TEXT,
    written_hook TEXT,
    video_created_date DATE,
    
    -- Basic metadata
    created_at TIMESTAMP DEFAULT NOW()
);

-- Basic indexes for performance
CREATE INDEX idx_videos_industry ON viral_videos(industry);
CREATE INDEX idx_videos_post_type ON viral_videos(post_type);
CREATE INDEX idx_videos_views ON viral_videos(views DESC);
CREATE INDEX idx_videos_date ON viral_videos(video_created_date);

-- Simple insert or update function
CREATE OR REPLACE FUNCTION upsert_video(
    p_url TEXT,
    p_views BIGINT,
    p_industry TEXT,
    p_post_type TEXT,
    p_visual_hook TEXT DEFAULT NULL,
    p_verbal_hook TEXT DEFAULT NULL,
    p_written_hook TEXT DEFAULT NULL,
    p_video_created_date DATE DEFAULT NULL
)
RETURNS TEXT AS $$
BEGIN
    -- Try to insert
    INSERT INTO viral_videos (
        url, views, industry, post_type, visual_hook, verbal_hook, written_hook, video_created_date
    )
    VALUES (
        p_url, p_views, p_industry, p_post_type, p_visual_hook, p_verbal_hook, p_written_hook, p_video_created_date
    )
    -- If URL exists, update instead
    ON CONFLICT (url) 
    DO UPDATE SET
        views = EXCLUDED.views,
        industry = EXCLUDED.industry,
        post_type = EXCLUDED.post_type,
        visual_hook = COALESCE(EXCLUDED.visual_hook, viral_videos.visual_hook),
        verbal_hook = COALESCE(EXCLUDED.verbal_hook, viral_videos.verbal_hook),
        written_hook = COALESCE(EXCLUDED.written_hook, viral_videos.written_hook),
        video_created_date = COALESCE(EXCLUDED.video_created_date, viral_videos.video_created_date);
    
    RETURN 'Success';
END;
$$ LANGUAGE plpgsql;

-- Test the table with sample data
INSERT INTO viral_videos (url, views, industry, post_type) 
VALUES ('https://tiktok.com/test', 1000000, 'Fitness', 'Before and After')
ON CONFLICT (url) DO NOTHING;

-- Common Post Types reference (for your application):
-- 'Day in a Life'
-- 'Before and After'
-- 'Tutorial'
-- 'Transformation'
-- 'Story Time'
-- 'Tips and Tricks'
-- 'Product Review'
-- 'Challenge'
-- 'Behind the Scenes'
-- 'Q&A'
-- 'Listicle'
-- 'Opinion/Hot Take'
-- 'Reaction'
-- 'Comparison'
-- 'Announcement'

-- Common Industries reference (matching your website):
-- 'Fitness'
-- 'Business'
-- 'Lifestyle' (includes beauty, fashion, travel)
-- 'Tech'

-- Basic queries you'll use:

-- Get all videos
-- SELECT * FROM viral_videos;

-- Get platform from URL
-- SELECT *, 
--   CASE 
--     WHEN url LIKE '%tiktok%' THEN 'tiktok'
--     WHEN url LIKE '%instagram%' THEN 'instagram'
--     WHEN url LIKE '%youtube%' THEN 'youtube'
--     ELSE 'other'
--   END as platform
-- FROM viral_videos;

-- Count by post type
-- SELECT post_type, COUNT(*) as count, AVG(views) as avg_views
-- FROM viral_videos
-- GROUP BY post_type
-- ORDER BY avg_views DESC;

-- Get industry stats
-- SELECT industry, COUNT(*) as videos, AVG(views) as avg_views
-- FROM viral_videos
-- GROUP BY industry;

-- Get top performing post types by industry
-- SELECT industry, post_type, COUNT(*) as count, AVG(views) as avg_views
-- FROM viral_videos
-- GROUP BY industry, post_type
-- ORDER BY industry, avg_views DESC;