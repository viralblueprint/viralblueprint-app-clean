-- Drop existing tables if they exist
DROP TABLE IF EXISTS viral_videos CASCADE;
DROP TABLE IF EXISTS hook_patterns CASCADE;
DROP TABLE IF EXISTS pattern_performance CASCADE;
DROP TABLE IF EXISTS niches CASCADE;

-- Create main viral videos table with all scraper data
CREATE TABLE viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- URLs
    input_url TEXT NOT NULL, -- Creator's page URL
    url TEXT NOT NULL UNIQUE, -- Direct video URL
    thumbnail TEXT, -- Thumbnail URL
    
    -- Engagement metrics
    likes_count INTEGER DEFAULT 0,
    video_play_count INTEGER DEFAULT 0, -- Total plays (Instagram cares about this)
    video_view_count INTEGER DEFAULT 0, -- Unique viewers
    comments_count INTEGER DEFAULT 0,
    video_duration INTEGER, -- Duration in seconds
    
    -- Content categorization
    industry TEXT NOT NULL,
    post_type TEXT, -- Reel, Story, Post, etc.
    
    -- Hook analysis
    hook TEXT NOT NULL, -- The actual hook text/description
    visual_hook_type TEXT, -- Type of visual hook used
    audio_hook_type TEXT, -- Type of audio hook used  
    written_hook_type TEXT, -- Type of written/caption hook used
    
    -- Platform detection (auto-computed from URL)
    platform TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN url LIKE '%tiktok.com%' THEN 'tiktok'
            WHEN url LIKE '%instagram.com%' THEN 'instagram'
            WHEN url LIKE '%youtube.com%' OR url LIKE '%youtu.be%' THEN 'youtube'
            WHEN url LIKE '%twitter.com%' OR url LIKE '%x.com%' THEN 'twitter'
            ELSE 'other'
        END
    ) STORED,
    
    -- Timestamps
    timestamp TIMESTAMPTZ, -- When video was created
    date_inserted TIMESTAMPTZ DEFAULT NOW(), -- When we scraped the data
    
    -- Computed metrics for analysis
    engagement_rate DECIMAL(10, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN video_play_count > 0 
            THEN ((likes_count + comments_count)::DECIMAL / video_play_count * 100)
            ELSE 0
        END
    ) STORED,
    
    viral_score DECIMAL(10, 2) GENERATED ALWAYS AS (
        CASE
            WHEN video_play_count > 0
            THEN (
                (likes_count * 1.0 + comments_count * 2.0) / 
                GREATEST(video_play_count::DECIMAL / 1000, 1)
            )
            ELSE 0
        END
    ) STORED
);

-- Create hook patterns table for pattern analysis
CREATE TABLE hook_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    occurrence_frequency INTEGER DEFAULT 0,
    avg_viral_ratio DECIMAL(10, 2) DEFAULT 0,
    avg_engagement_rate DECIMAL(10, 2) DEFAULT 0,
    sample_size INTEGER DEFAULT 0,
    confidence_level DECIMAL(5, 2) DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create pattern performance tracking
CREATE TABLE pattern_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_id UUID REFERENCES hook_patterns(id) ON DELETE CASCADE,
    time_period TEXT NOT NULL,
    viral_ratio DECIMAL(10, 2) NOT NULL,
    success_rate DECIMAL(5, 2) NOT NULL,
    sample_size INTEGER NOT NULL,
    avg_views INTEGER,
    avg_likes INTEGER,
    avg_comments INTEGER,
    statistical_significance DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create industries/niches table
CREATE TABLE industries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    parent_category TEXT,
    content_count INTEGER DEFAULT 0,
    avg_performance DECIMAL(10, 2) DEFAULT 0,
    trending_score DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_viral_videos_platform ON viral_videos(platform);
CREATE INDEX idx_viral_videos_industry ON viral_videos(industry);
CREATE INDEX idx_viral_videos_post_type ON viral_videos(post_type);
CREATE INDEX idx_viral_videos_timestamp ON viral_videos(timestamp DESC);
CREATE INDEX idx_viral_videos_date_inserted ON viral_videos(date_inserted DESC);
CREATE INDEX idx_viral_videos_video_play_count ON viral_videos(video_play_count DESC);
CREATE INDEX idx_viral_videos_engagement_rate ON viral_videos(engagement_rate DESC);
CREATE INDEX idx_viral_videos_viral_score ON viral_videos(viral_score DESC);
CREATE INDEX idx_viral_videos_hook_types ON viral_videos(visual_hook_type, audio_hook_type, written_hook_type);

-- Create views for easier querying
CREATE OR REPLACE VIEW trending_content AS
SELECT 
    v.*,
    CASE 
        WHEN date_inserted > NOW() - INTERVAL '7 days' THEN 'This Week'
        WHEN date_inserted > NOW() - INTERVAL '30 days' THEN 'This Month'
        WHEN date_inserted > NOW() - INTERVAL '90 days' THEN 'Last 3 Months'
        ELSE 'Older'
    END as recency_category,
    RANK() OVER (PARTITION BY industry ORDER BY viral_score DESC) as industry_rank,
    RANK() OVER (ORDER BY viral_score DESC) as overall_rank
FROM viral_videos v
WHERE video_play_count > 1000;

CREATE OR REPLACE VIEW hook_effectiveness AS
SELECT 
    hook,
    visual_hook_type,
    audio_hook_type,
    written_hook_type,
    COUNT(*) as usage_count,
    AVG(video_play_count) as avg_views,
    AVG(engagement_rate) as avg_engagement,
    AVG(viral_score) as avg_viral_score,
    MAX(video_play_count) as best_performance
FROM viral_videos
GROUP BY hook, visual_hook_type, audio_hook_type, written_hook_type
HAVING COUNT(*) >= 3
ORDER BY avg_viral_score DESC;

-- Create a materialized view for platform-specific metrics
CREATE MATERIALIZED VIEW platform_metrics AS
SELECT 
    platform,
    industry,
    COUNT(*) as video_count,
    AVG(video_play_count) as avg_plays,
    AVG(video_view_count) as avg_unique_views,
    AVG(likes_count) as avg_likes,
    AVG(comments_count) as avg_comments,
    AVG(engagement_rate) as avg_engagement_rate,
    AVG(viral_score) as avg_viral_score,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY video_play_count) as median_plays,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY video_play_count) as p90_plays
FROM viral_videos
GROUP BY platform, industry;

-- Create function to auto-update industries table
CREATE OR REPLACE FUNCTION update_industry_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO industries (name, content_count, avg_performance)
    VALUES (NEW.industry, 1, NEW.viral_score)
    ON CONFLICT (name) DO UPDATE
    SET 
        content_count = industries.content_count + 1,
        avg_performance = (
            (industries.avg_performance * industries.content_count + NEW.viral_score) / 
            (industries.content_count + 1)
        );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_industry_on_insert
AFTER INSERT ON viral_videos
FOR EACH ROW
EXECUTE FUNCTION update_industry_stats();

-- Add RLS (Row Level Security) policies
ALTER TABLE viral_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hook_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON viral_videos FOR SELECT USING (true);
CREATE POLICY "Public read access" ON hook_patterns FOR SELECT USING (true);
CREATE POLICY "Public read access" ON pattern_performance FOR SELECT USING (true);
CREATE POLICY "Public read access" ON industries FOR SELECT USING (true);

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_platform_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW platform_metrics;
END;
$$ LANGUAGE plpgsql;

-- Sample data insertion for testing (you can remove this section)
INSERT INTO viral_videos (
    input_url, url, thumbnail, likes_count, video_play_count, 
    video_view_count, comments_count, video_duration, industry, 
    post_type, hook, visual_hook_type, audio_hook_type, 
    written_hook_type, timestamp
) VALUES 
(
    'https://www.instagram.com/creator1',
    'https://www.instagram.com/reel/ABC123',
    'https://example.com/thumb1.jpg',
    50000,
    1200000,
    980000,
    3500,
    30,
    'Fitness',
    'Reel',
    'POV: You start working out for 30 days',
    'Before/After Split Screen',
    'Trending Audio',
    'POV Format',
    NOW() - INTERVAL '5 days'
),
(
    'https://www.tiktok.com/@creator2',
    'https://www.tiktok.com/video/XYZ789',
    'https://example.com/thumb2.jpg',
    125000,
    2500000,
    2100000,
    8900,
    45,
    'Business',
    'Video',
    'How I made $10k in 30 days',
    'Screen Recording',
    'Voiceover',
    'How-to Hook',
    NOW() - INTERVAL '10 days'
);

-- Grant necessary permissions for Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;