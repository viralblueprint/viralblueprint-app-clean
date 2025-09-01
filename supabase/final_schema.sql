-- Final Simplified Schema - ONE TABLE for all video data
-- Matches your Excel structure exactly

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
    
    -- Auto-detected platform from URL
    platform TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN url LIKE '%tiktok%' THEN 'tiktok'
            WHEN url LIKE '%instagram%' THEN 'instagram'
            WHEN url LIKE '%youtube%' THEN 'youtube'
            ELSE 'unknown'
        END
    ) STORED,
    
    -- Calculated field for analytics
    days_since_posted INT GENERATED ALWAYS AS (
        CASE 
            WHEN video_created_date IS NOT NULL 
            THEN (CURRENT_DATE - video_created_date)
            ELSE NULL
        END
    ) STORED,
    
    -- System timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Analytics Views (calculated on the fly, no need for second table)

-- View: Hook frequency (no need to store counts)
CREATE OR REPLACE VIEW hook_analytics AS
WITH hook_counts AS (
    SELECT 
        'visual' as hook_type,
        visual_hook as hook_text,
        COUNT(*) as usage_count,
        AVG(views)::BIGINT as avg_views,
        STRING_AGG(DISTINCT niche, ', ') as niches_used
    FROM viral_videos
    WHERE visual_hook IS NOT NULL
    GROUP BY visual_hook
    
    UNION ALL
    
    SELECT 
        'verbal' as hook_type,
        verbal_hook,
        COUNT(*),
        AVG(views)::BIGINT,
        STRING_AGG(DISTINCT niche, ', ')
    FROM viral_videos
    WHERE verbal_hook IS NOT NULL
    GROUP BY verbal_hook
    
    UNION ALL
    
    SELECT 
        'written' as hook_type,
        written_hook,
        COUNT(*),
        AVG(views)::BIGINT,
        STRING_AGG(DISTINCT niche, ', ')
    FROM viral_videos
    WHERE written_hook IS NOT NULL
    GROUP BY written_hook
)
SELECT * FROM hook_counts
ORDER BY usage_count DESC;

-- View: Niche performance
CREATE OR REPLACE VIEW niche_analytics AS
SELECT 
    niche,
    COUNT(*) as video_count,
    AVG(views)::BIGINT as avg_views,
    MAX(views) as max_views,
    MIN(views) as min_views
FROM viral_videos
GROUP BY niche
ORDER BY avg_views DESC;

-- View: Time-based trends
CREATE OR REPLACE VIEW trend_analytics AS
SELECT 
    DATE_TRUNC('week', video_created_date) as week,
    COUNT(*) as videos_posted,
    AVG(views)::BIGINT as avg_views,
    STRING_AGG(DISTINCT niche, ', ') as niches
FROM viral_videos
WHERE video_created_date IS NOT NULL
GROUP BY week
ORDER BY week DESC;

-- Sample queries for your use:

-- Find most used hooks
-- SELECT * FROM hook_analytics WHERE usage_count > 1;

-- Get niche performance
-- SELECT * FROM niche_analytics;

-- Find videos with all three hook types
-- SELECT * FROM viral_videos 
-- WHERE visual_hook IS NOT NULL 
-- AND verbal_hook IS NOT NULL 
-- AND written_hook IS NOT NULL;

-- Get recent viral videos (>1M views in last 7 days)
-- SELECT * FROM viral_videos 
-- WHERE views > 1000000 
-- AND video_created_date >= CURRENT_DATE - 7;