-- Simplified Viralizes Database Schema
-- Stores only: URL, Views, Niche, and 3 Hook Types
-- Hook pattern frequency is calculated dynamically

-- Drop existing tables if you want a clean slate (BE CAREFUL - this deletes all data!)
-- DROP TABLE IF EXISTS viral_videos CASCADE;
-- DROP TABLE IF EXISTS hook_patterns CASCADE;

-- Main table for viral videos
CREATE TABLE IF NOT EXISTS viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    views BIGINT NOT NULL,
    niche TEXT NOT NULL,
    
    -- Three types of hooks
    visual_hook TEXT,    -- What you see (visual elements, actions, scenes)
    verbal_hook TEXT,    -- What you hear (spoken words, voiceover)
    written_hook TEXT,   -- What you read (on-screen text, captions)
    
    -- Auto-calculated fields
    platform TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN url LIKE '%tiktok%' THEN 'tiktok'
            WHEN url LIKE '%instagram%' THEN 'instagram'
            WHEN url LIKE '%youtube%' THEN 'youtube'
            ELSE 'unknown'
        END
    ) STORED,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hook patterns table (stores unique patterns only)
CREATE TABLE IF NOT EXISTS hook_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_text TEXT UNIQUE NOT NULL,
    pattern_type TEXT CHECK (pattern_type IN ('visual', 'verbal', 'written')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_viral_videos_niche ON viral_videos(niche);
CREATE INDEX IF NOT EXISTS idx_viral_videos_views ON viral_videos(views DESC);
CREATE INDEX IF NOT EXISTS idx_viral_videos_platform ON viral_videos(platform);
CREATE INDEX IF NOT EXISTS idx_viral_videos_visual_hook ON viral_videos(visual_hook);
CREATE INDEX IF NOT EXISTS idx_viral_videos_verbal_hook ON viral_videos(verbal_hook);
CREATE INDEX IF NOT EXISTS idx_viral_videos_written_hook ON viral_videos(written_hook);

-- Enable Row Level Security
ALTER TABLE viral_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hook_patterns ENABLE ROW LEVEL SECURITY;

-- Public read access (no auth required for Phase 1)
CREATE POLICY "Public read access for viral_videos" ON viral_videos
    FOR SELECT USING (true);

CREATE POLICY "Public read access for hook_patterns" ON hook_patterns
    FOR SELECT USING (true);

-- Create UPSERT function for easy insertion/updates
CREATE OR REPLACE FUNCTION upsert_viral_video(
    p_url TEXT,
    p_views BIGINT,
    p_niche TEXT,
    p_visual_hook TEXT DEFAULT NULL,
    p_verbal_hook TEXT DEFAULT NULL,
    p_written_hook TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    status TEXT
) AS $$
DECLARE
    v_id UUID;
    v_status TEXT;
BEGIN
    -- Try to update existing video first
    UPDATE viral_videos
    SET 
        views = p_views,
        niche = p_niche,
        visual_hook = COALESCE(p_visual_hook, viral_videos.visual_hook),
        verbal_hook = COALESCE(p_verbal_hook, viral_videos.verbal_hook),
        written_hook = COALESCE(p_written_hook, viral_videos.written_hook),
        updated_at = NOW()
    WHERE url = p_url
    RETURNING viral_videos.id INTO v_id;
    
    IF v_id IS NOT NULL THEN
        v_status := 'updated';
    ELSE
        -- Insert new video if not found
        INSERT INTO viral_videos (url, views, niche, visual_hook, verbal_hook, written_hook)
        VALUES (p_url, p_views, p_niche, p_visual_hook, p_verbal_hook, p_written_hook)
        RETURNING viral_videos.id INTO v_id;
        
        v_status := 'created';
    END IF;
    
    -- Auto-add hook patterns if they don't exist
    IF p_visual_hook IS NOT NULL THEN
        INSERT INTO hook_patterns (pattern_text, pattern_type)
        VALUES (p_visual_hook, 'visual')
        ON CONFLICT (pattern_text) DO NOTHING;
    END IF;
    
    IF p_verbal_hook IS NOT NULL THEN
        INSERT INTO hook_patterns (pattern_text, pattern_type)
        VALUES (p_verbal_hook, 'verbal')
        ON CONFLICT (pattern_text) DO NOTHING;
    END IF;
    
    IF p_written_hook IS NOT NULL THEN
        INSERT INTO hook_patterns (pattern_text, pattern_type)
        VALUES (p_written_hook, 'written')
        ON CONFLICT (pattern_text) DO NOTHING;
    END IF;
    
    RETURN QUERY SELECT v_id, v_status;
END;
$$ LANGUAGE plpgsql;

-- Function to get hook pattern statistics (calculated on-the-fly)
CREATE OR REPLACE FUNCTION get_hook_stats()
RETURNS TABLE (
    hook_text TEXT,
    hook_type TEXT,
    usage_count BIGINT,
    total_views BIGINT,
    avg_views BIGINT,
    top_niche TEXT
) AS $$
BEGIN
    -- Visual hooks stats
    RETURN QUERY
    SELECT 
        visual_hook as hook_text,
        'visual'::TEXT as hook_type,
        COUNT(*)::BIGINT as usage_count,
        SUM(views)::BIGINT as total_views,
        AVG(views)::BIGINT as avg_views,
        MODE() WITHIN GROUP (ORDER BY niche) as top_niche
    FROM viral_videos
    WHERE visual_hook IS NOT NULL
    GROUP BY visual_hook
    
    UNION ALL
    
    -- Verbal hooks stats
    SELECT 
        verbal_hook,
        'verbal'::TEXT,
        COUNT(*)::BIGINT,
        SUM(views)::BIGINT,
        AVG(views)::BIGINT,
        MODE() WITHIN GROUP (ORDER BY niche)
    FROM viral_videos
    WHERE verbal_hook IS NOT NULL
    GROUP BY verbal_hook
    
    UNION ALL
    
    -- Written hooks stats
    SELECT 
        written_hook,
        'written'::TEXT,
        COUNT(*)::BIGINT,
        SUM(views)::BIGINT,
        AVG(views)::BIGINT,
        MODE() WITHIN GROUP (ORDER BY niche)
    FROM viral_videos
    WHERE written_hook IS NOT NULL
    GROUP BY written_hook
    
    ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get niche performance
CREATE OR REPLACE FUNCTION get_niche_stats()
RETURNS TABLE (
    niche TEXT,
    video_count BIGINT,
    total_views BIGINT,
    avg_views BIGINT,
    top_visual_hook TEXT,
    top_verbal_hook TEXT,
    top_written_hook TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.niche,
        COUNT(*)::BIGINT as video_count,
        SUM(v.views)::BIGINT as total_views,
        AVG(v.views)::BIGINT as avg_views,
        (
            SELECT visual_hook 
            FROM viral_videos 
            WHERE niche = v.niche AND visual_hook IS NOT NULL
            GROUP BY visual_hook 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ) as top_visual_hook,
        (
            SELECT verbal_hook 
            FROM viral_videos 
            WHERE niche = v.niche AND verbal_hook IS NOT NULL
            GROUP BY verbal_hook 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ) as top_verbal_hook,
        (
            SELECT written_hook 
            FROM viral_videos 
            WHERE niche = v.niche AND written_hook IS NOT NULL
            GROUP BY written_hook 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ) as top_written_hook
    FROM viral_videos v
    GROUP BY v.niche
    ORDER BY avg_views DESC;
END;
$$ LANGUAGE plpgsql;

-- View for easy access to all video data with calculated metrics
CREATE OR REPLACE VIEW video_analytics AS
SELECT 
    v.*,
    -- Calculate engagement score based on views
    CASE 
        WHEN v.views > 10000000 THEN 'mega-viral'
        WHEN v.views > 1000000 THEN 'viral'
        WHEN v.views > 100000 THEN 'trending'
        ELSE 'standard'
    END as performance_tier,
    
    -- Count how many videos use the same hooks
    (SELECT COUNT(*) FROM viral_videos WHERE visual_hook = v.visual_hook) as visual_hook_frequency,
    (SELECT COUNT(*) FROM viral_videos WHERE verbal_hook = v.verbal_hook) as verbal_hook_frequency,
    (SELECT COUNT(*) FROM viral_videos WHERE written_hook = v.written_hook) as written_hook_frequency
    
FROM viral_videos v;