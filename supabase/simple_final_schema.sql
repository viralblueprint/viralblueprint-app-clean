-- Simplified Final Schema - ONE TABLE for all video data
-- Without complex calculated fields to avoid errors

-- Drop old tables if starting fresh
DROP TABLE IF EXISTS viral_videos CASCADE;
DROP TABLE IF EXISTS hook_patterns CASCADE;
DROP TABLE IF EXISTS viral_content CASCADE;
DROP TABLE IF EXISTS pattern_performance CASCADE;
DROP TABLE IF EXISTS niches CASCADE;

-- Single table for all viral video data
CREATE TABLE IF NOT EXISTS viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Core fields from your Excel
    url TEXT UNIQUE NOT NULL,
    views BIGINT NOT NULL,
    niche TEXT NOT NULL,
    visual_hook TEXT,
    verbal_hook TEXT,
    written_hook TEXT,
    video_created_date DATE,
    
    -- Simple platform detection
    platform TEXT,
    
    -- System timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update platform based on URL with a trigger
CREATE OR REPLACE FUNCTION update_platform()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.url LIKE '%tiktok%' THEN
        NEW.platform := 'tiktok';
    ELSIF NEW.url LIKE '%instagram%' THEN
        NEW.platform := 'instagram';
    ELSIF NEW.url LIKE '%youtube%' THEN
        NEW.platform := 'youtube';
    ELSE
        NEW.platform := 'unknown';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_platform
    BEFORE INSERT OR UPDATE ON viral_videos
    FOR EACH ROW
    EXECUTE FUNCTION update_platform();

-- Indexes for fast queries
CREATE INDEX idx_viral_videos_niche ON viral_videos(niche);
CREATE INDEX idx_viral_videos_views ON viral_videos(views DESC);
CREATE INDEX idx_viral_videos_platform ON viral_videos(platform);
CREATE INDEX idx_viral_videos_date ON viral_videos(video_created_date DESC);

-- Enable RLS (but allow public read for now)
ALTER TABLE viral_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON viral_videos
    FOR SELECT USING (true);

-- Simple UPSERT function (insert or update based on URL)
CREATE OR REPLACE FUNCTION upsert_viral_video(
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
    INSERT INTO viral_videos (
        url, views, niche, visual_hook, verbal_hook, written_hook, video_created_date
    )
    VALUES (
        p_url, p_views, p_niche, p_visual_hook, p_verbal_hook, p_written_hook, p_video_created_date
    )
    ON CONFLICT (url) 
    DO UPDATE SET
        views = EXCLUDED.views,
        niche = EXCLUDED.niche,
        visual_hook = COALESCE(EXCLUDED.visual_hook, viral_videos.visual_hook),
        verbal_hook = COALESCE(EXCLUDED.verbal_hook, viral_videos.verbal_hook),
        written_hook = COALESCE(EXCLUDED.written_hook, viral_videos.written_hook),
        video_created_date = COALESCE(EXCLUDED.video_created_date, viral_videos.video_created_date),
        updated_at = NOW();
    
    RETURN 'Success';
END;
$$ LANGUAGE plpgsql;

-- Function to calculate days since posted (use in queries when needed)
CREATE OR REPLACE FUNCTION get_days_since_posted(p_date DATE)
RETURNS INT AS $$
BEGIN
    IF p_date IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN CURRENT_DATE - p_date;
END;
$$ LANGUAGE plpgsql;

-- Analytics Views

-- View: Hook frequency
CREATE OR REPLACE VIEW hook_analytics AS
WITH hook_counts AS (
    SELECT 
        'visual' as hook_type,
        visual_hook as hook_text,
        COUNT(*) as usage_count,
        AVG(views)::BIGINT as avg_views
    FROM viral_videos
    WHERE visual_hook IS NOT NULL AND visual_hook != ''
    GROUP BY visual_hook
    
    UNION ALL
    
    SELECT 
        'verbal' as hook_type,
        verbal_hook,
        COUNT(*),
        AVG(views)::BIGINT
    FROM viral_videos
    WHERE verbal_hook IS NOT NULL AND verbal_hook != ''
    GROUP BY verbal_hook
    
    UNION ALL
    
    SELECT 
        'written' as hook_type,
        written_hook,
        COUNT(*),
        AVG(views)::BIGINT
    FROM viral_videos
    WHERE written_hook IS NOT NULL AND written_hook != ''
    GROUP BY written_hook
)
SELECT * FROM hook_counts
WHERE usage_count > 0
ORDER BY usage_count DESC, avg_views DESC;

-- View: Niche performance  
CREATE OR REPLACE VIEW niche_analytics AS
SELECT 
    niche,
    COUNT(*) as video_count,
    AVG(views)::BIGINT as avg_views,
    MAX(views) as max_views,
    MIN(views) as min_views,
    SUM(views) as total_views
FROM viral_videos
GROUP BY niche
ORDER BY avg_views DESC;

-- View: Platform comparison
CREATE OR REPLACE VIEW platform_analytics AS
SELECT 
    platform,
    COUNT(*) as video_count,
    AVG(views)::BIGINT as avg_views,
    MAX(views) as max_views
FROM viral_videos
WHERE platform IS NOT NULL
GROUP BY platform
ORDER BY avg_views DESC;

-- Sample test data to verify everything works
INSERT INTO viral_videos (url, views, niche, visual_hook, verbal_hook, written_hook, video_created_date) 
VALUES 
('https://tiktok.com/@test/video/1', 1000000, 'Fitness', 'Quick cuts', 'POV: First day', 'DAY 1', '2024-03-15'),
('https://instagram.com/reel/test1', 2000000, 'Beauty/Skincare', 'Close-up', 'Glass skin routine', 'GLOW UP', '2024-03-14')
ON CONFLICT (url) DO NOTHING;

-- Verify with queries:
-- SELECT * FROM viral_videos;
-- SELECT * FROM hook_analytics;
-- SELECT * FROM niche_analytics;
-- SELECT * FROM platform_analytics;

-- To get days since posted in queries:
-- SELECT *, get_days_since_posted(video_created_date) as days_old FROM viral_videos;