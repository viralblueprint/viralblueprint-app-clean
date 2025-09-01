-- Most Basic Schema - No Generated Columns, No Complex Features
-- Just the essential fields you need

-- Drop old tables if starting fresh (BE CAREFUL - this deletes all data!)
DROP TABLE IF EXISTS viral_videos CASCADE;
DROP TABLE IF EXISTS hook_patterns CASCADE;
DROP TABLE IF EXISTS viral_content CASCADE;
DROP TABLE IF EXISTS pattern_performance CASCADE;
DROP TABLE IF EXISTS niches CASCADE;

-- Single simple table for all viral video data
CREATE TABLE viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Your 7 essential fields
    url TEXT UNIQUE NOT NULL,
    views BIGINT NOT NULL,
    niche TEXT NOT NULL,
    visual_hook TEXT,
    verbal_hook TEXT,
    written_hook TEXT,
    video_created_date DATE,
    
    -- Basic metadata
    created_at TIMESTAMP DEFAULT NOW()
);

-- Basic indexes for performance
CREATE INDEX idx_videos_niche ON viral_videos(niche);
CREATE INDEX idx_videos_views ON viral_videos(views DESC);
CREATE INDEX idx_videos_date ON viral_videos(video_created_date);

-- Simple insert or update function
CREATE OR REPLACE FUNCTION upsert_video(
    p_url TEXT,
    p_views BIGINT,
    p_niche TEXT,
    p_visual_hook TEXT DEFAULT NULL,
    p_verbal_hook TEXT DEFAULT NULL,
    p_written_hook TEXT DEFAULT NULL,
    p_video_created_date DATE DEFAULT NULL
)
RETURNS TEXT AS $$
BEGIN
    -- Try to insert
    INSERT INTO viral_videos (
        url, views, niche, visual_hook, verbal_hook, written_hook, video_created_date
    )
    VALUES (
        p_url, p_views, p_niche, p_visual_hook, p_verbal_hook, p_written_hook, p_video_created_date
    )
    -- If URL exists, update instead
    ON CONFLICT (url) 
    DO UPDATE SET
        views = EXCLUDED.views,
        niche = EXCLUDED.niche,
        visual_hook = COALESCE(EXCLUDED.visual_hook, viral_videos.visual_hook),
        verbal_hook = COALESCE(EXCLUDED.verbal_hook, viral_videos.verbal_hook),
        written_hook = COALESCE(EXCLUDED.written_hook, viral_videos.written_hook),
        video_created_date = COALESCE(EXCLUDED.video_created_date, viral_videos.video_created_date);
    
    RETURN 'Success';
END;
$$ LANGUAGE plpgsql;

-- Test the table with sample data
INSERT INTO viral_videos (url, views, niche) 
VALUES ('https://tiktok.com/test', 1000000, 'Fitness')
ON CONFLICT (url) DO NOTHING;

-- Basic queries you'll use:

-- Get all videos
-- SELECT * FROM viral_videos;

-- Get platform from URL
-- SELECT *, 
--   CASE 
--     WHEN url LIKE '%tiktok%' THEN 'tiktok'
--     WHEN url LIKE '%instagram%' THEN 'instagram'
--     ELSE 'other'
--   END as platform
-- FROM viral_videos;

-- Count hooks by type
-- SELECT visual_hook, COUNT(*) as times_used, AVG(views) as avg_views
-- FROM viral_videos
-- WHERE visual_hook IS NOT NULL
-- GROUP BY visual_hook
-- ORDER BY times_used DESC;

-- Get niche stats
-- SELECT niche, COUNT(*) as videos, AVG(views) as avg_views
-- FROM viral_videos
-- GROUP BY niche;