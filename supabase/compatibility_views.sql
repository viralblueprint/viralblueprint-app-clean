-- Compatibility views to make the website work with the new simple table
-- These views make the new viral_videos table look like the old structure

-- Create a view that looks like the old hook_patterns table
CREATE OR REPLACE VIEW hook_patterns AS
SELECT DISTINCT ON (hook_text)
  MD5(hook_text)::uuid as id,
  hook_text as template,
  hook_type as category,
  COUNT(*) OVER (PARTITION BY hook_text) as occurrence_frequency,
  AVG(avg_views) OVER (PARTITION BY hook_text) / 100000 as avg_viral_ratio,
  COUNT(*) OVER (PARTITION BY hook_text) as sample_size,
  CASE 
    WHEN COUNT(*) OVER (PARTITION BY hook_text) > 10 THEN 95
    WHEN COUNT(*) OVER (PARTITION BY hook_text) > 5 THEN 85
    ELSE 70
  END as confidence_level,
  NOW() as last_updated
FROM (
  SELECT verbal_hook as hook_text, 'Verbal' as hook_type, views as avg_views
  FROM viral_videos WHERE verbal_hook IS NOT NULL AND verbal_hook != ''
  UNION ALL
  SELECT visual_hook, 'Visual', views
  FROM viral_videos WHERE visual_hook IS NOT NULL AND visual_hook != ''
  UNION ALL
  SELECT written_hook, 'Written', views
  FROM viral_videos WHERE written_hook IS NOT NULL AND written_hook != ''
) as all_hooks
ORDER BY hook_text, hook_type;

-- Create a view that looks like the old viral_content table
CREATE OR REPLACE VIEW viral_content AS
SELECT 
  id,
  CASE 
    WHEN url LIKE '%tiktok%' THEN 'tiktok'
    WHEN url LIKE '%instagram%' THEN 'instagram'
    ELSE 'youtube'
  END as platform,
  url,
  views,
  1000000 as followers_at_time, -- Default value since we don't track this
  views / 1000000.0 as viral_ratio, -- Simplified ratio
  COALESCE(video_created_date, CURRENT_DATE) as date_posted,
  niche,
  'video' as format_type,
  COALESCE(verbal_hook, visual_hook, written_hook, 'No hook') as hook_text,
  visual_hook as visual_hook_desc,
  verbal_hook as verbal_hook_text,
  written_hook as written_hook_text,
  created_at
FROM viral_videos;

-- Create a view for niches
CREATE OR REPLACE VIEW niches AS
SELECT DISTINCT
  MD5(niche)::uuid as id,
  niche as name,
  'General' as parent_category,
  COUNT(*) OVER (PARTITION BY niche) as content_count,
  AVG(views) OVER (PARTITION BY niche) / 1000000 as avg_performance
FROM viral_videos
WHERE niche IS NOT NULL;

-- Create an empty view for pattern_performance (not used in simple schema)
CREATE OR REPLACE VIEW pattern_performance AS
SELECT 
  gen_random_uuid() as id,
  gen_random_uuid() as pattern_id,
  'N/A' as time_period,
  0 as viral_ratio,
  0 as success_rate,
  0 as sample_size,
  0 as statistical_significance
WHERE 1=0; -- Always returns empty

-- Grant permissions
GRANT SELECT ON hook_patterns TO anon, authenticated;
GRANT SELECT ON viral_content TO anon, authenticated;
GRANT SELECT ON niches TO anon, authenticated;
GRANT SELECT ON pattern_performance TO anon, authenticated;