-- Create tables for Viralizes platform

-- Niches table
CREATE TABLE IF NOT EXISTS niches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    parent_category TEXT,
    content_count INTEGER DEFAULT 0,
    avg_performance DECIMAL(10, 2) DEFAULT 0
);

-- Hook patterns table
CREATE TABLE IF NOT EXISTS hook_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template TEXT NOT NULL,
    category TEXT NOT NULL,
    occurrence_frequency INTEGER DEFAULT 0,
    avg_viral_ratio DECIMAL(10, 2) DEFAULT 0,
    sample_size INTEGER DEFAULT 0,
    confidence_level DECIMAL(5, 2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Viral content table
CREATE TABLE IF NOT EXISTS viral_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT CHECK (platform IN ('tiktok', 'instagram', 'youtube')) NOT NULL,
    url TEXT NOT NULL,
    views BIGINT NOT NULL,
    followers_at_time BIGINT NOT NULL,
    viral_ratio DECIMAL(10, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN followers_at_time > 0 THEN views::DECIMAL / followers_at_time
            ELSE 0
        END
    ) STORED,
    date_posted TIMESTAMP WITH TIME ZONE NOT NULL,
    niche TEXT NOT NULL,
    format_type TEXT CHECK (format_type IN ('video', 'image', 'carousel')) NOT NULL,
    hook_text TEXT NOT NULL,
    visual_hook_desc TEXT,
    verbal_hook_text TEXT,
    written_hook_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern performance table
CREATE TABLE IF NOT EXISTS pattern_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_id UUID REFERENCES hook_patterns(id) ON DELETE CASCADE,
    time_period TEXT NOT NULL,
    viral_ratio DECIMAL(10, 2) NOT NULL,
    success_rate DECIMAL(5, 2) NOT NULL,
    sample_size INTEGER NOT NULL,
    statistical_significance DECIMAL(5, 4) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_viral_content_viral_ratio ON viral_content(viral_ratio DESC);
CREATE INDEX IF NOT EXISTS idx_viral_content_niche ON viral_content(niche);
CREATE INDEX IF NOT EXISTS idx_viral_content_date ON viral_content(date_posted DESC);
CREATE INDEX IF NOT EXISTS idx_hook_patterns_avg_ratio ON hook_patterns(avg_viral_ratio DESC);
CREATE INDEX IF NOT EXISTS idx_pattern_performance_pattern ON pattern_performance(pattern_id);

-- Enable Row Level Security (RLS)
ALTER TABLE viral_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE hook_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_performance ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (Phase 1 - no auth)
CREATE POLICY "Public read access for viral_content" ON viral_content
    FOR SELECT USING (true);

CREATE POLICY "Public read access for hook_patterns" ON hook_patterns
    FOR SELECT USING (true);

CREATE POLICY "Public read access for niches" ON niches
    FOR SELECT USING (true);

CREATE POLICY "Public read access for pattern_performance" ON pattern_performance
    FOR SELECT USING (true);