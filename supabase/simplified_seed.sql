-- Seed data for simplified Viralizes schema
-- Example videos with the 3 types of hooks

INSERT INTO viral_videos (url, views, niche, visual_hook, verbal_hook, written_hook) VALUES
-- Fitness videos
('https://tiktok.com/@fitguru/video/1', 5200000, 'Fitness', 
 'Quick cuts between before/after shots', 
 'POV: You finally hit your PR and the gym bros notice',
 'DAY 47 OF 75 HARD'),

('https://instagram.com/reel/fitness1', 3100000, 'Fitness',
 'Time-lapse transformation montage',
 'Nobody asked but here''s how I lost 30lbs',
 'Wait for it...'),

('https://tiktok.com/@gymlife/video/2', 2800000, 'Fitness',
 'Shaky camera during heavy lift',
 'This is why you shouldn''t skip leg day',
 '5 exercises you''re doing WRONG'),

-- Business/Finance videos  
('https://tiktok.com/@entrepreneur/video/1', 8900000, 'Business/Finance',
 'Screen recording of earnings dashboard',
 'How I made $10k in 30 days with no experience',
 '$0 to $10,000 in 30 DAYS'),

('https://instagram.com/reel/business1', 4200000, 'Business/Finance',
 'Luxury car and laptop lifestyle shots',
 'The side hustle nobody talks about',
 '3 income streams you need in 2024'),

-- Lifestyle videos
('https://tiktok.com/@lifestyle/video/1', 6700000, 'Lifestyle',
 'Aesthetic morning routine montage',
 'POV: You''re becoming that girl',
 '5AM MORNING ROUTINE'),

('https://instagram.com/reel/lifestyle1', 3900000, 'Lifestyle',
 'Room makeover timelapse',
 'Sunday reset routine for productivity',
 'CLEAN WITH ME'),

-- Beauty/Skincare videos
('https://tiktok.com/@skincare/video/1', 7300000, 'Beauty/Skincare',
 'Close-up skin texture before/after',
 'The Korean skincare secret that changed my skin',
 'GLASS SKIN IN 7 DAYS'),

('https://instagram.com/reel/beauty1', 5100000, 'Beauty/Skincare',
 'Product application in slow motion',
 'Dermatologist told me to stop doing this',
 'VIRAL SKINCARE HACK'),

-- Food/Cooking videos
('https://tiktok.com/@foodie/video/1', 9500000, 'Food/Cooking',
 'Overhead shot of ingredients coming together',
 'Gordon Ramsay would be proud',
 '2-MINUTE PASTA HACK'),

('https://instagram.com/reel/food1', 4600000, 'Food/Cooking',
 'Satisfying food prep compilation',
 'Meal prep Sunday for weight loss',
 'SAVE THIS RECIPE'),

-- Fashion videos
('https://tiktok.com/@fashion/video/1', 5800000, 'Fashion',
 'Outfit transition with spin effect',
 'When you find the perfect thrift piece',
 'OUTFIT IDEAS FOR YOUR BODY TYPE'),

('https://instagram.com/reel/fashion1', 3200000, 'Fashion',
 'Closet organization before/after',
 'Capsule wardrobe essentials you actually need',
 '10 ITEMS, 30 OUTFITS'),

-- Tech/Gaming videos
('https://tiktok.com/@gamer/video/1', 11200000, 'Tech/Gaming',
 'Gameplay clutch moment in slow-mo',
 'This setting doubled my FPS',
 'INSANE 1v5 CLUTCH'),

('https://instagram.com/reel/tech1', 6400000, 'Tech/Gaming',
 'RGB setup showcase with transitions',
 'Budget setup that beats expensive rigs',
 'SETUP TOUR 2024')

ON CONFLICT (url) DO NOTHING;

-- Query examples to analyze your data:

-- 1. Get most used hooks across all videos
SELECT * FROM get_hook_stats() LIMIT 10;

-- 2. Get performance by niche
SELECT * FROM get_niche_stats();

-- 3. Find videos with similar hooks
SELECT url, views, niche, verbal_hook 
FROM viral_videos 
WHERE verbal_hook LIKE '%POV:%'
ORDER BY views DESC;

-- 4. Get hook frequency without storing it
SELECT 
    visual_hook,
    COUNT(*) as times_used,
    AVG(views) as avg_views,
    SUM(views) as total_views
FROM viral_videos
WHERE visual_hook IS NOT NULL
GROUP BY visual_hook
ORDER BY times_used DESC;

-- 5. Find most successful hook combinations
SELECT 
    niche,
    visual_hook,
    verbal_hook, 
    written_hook,
    views
FROM viral_videos
ORDER BY views DESC
LIMIT 10;

-- 6. Analyze which hook type matters most per niche
WITH hook_performance AS (
    SELECT 
        niche,
        'visual' as hook_type,
        AVG(views) as avg_views
    FROM viral_videos
    WHERE visual_hook IS NOT NULL
    GROUP BY niche
    
    UNION ALL
    
    SELECT 
        niche,
        'verbal' as hook_type,
        AVG(views) as avg_views
    FROM viral_videos
    WHERE verbal_hook IS NOT NULL
    GROUP BY niche
    
    UNION ALL
    
    SELECT 
        niche,
        'written' as hook_type,
        AVG(views) as avg_views
    FROM viral_videos
    WHERE written_hook IS NOT NULL
    GROUP BY niche
)
SELECT 
    niche,
    hook_type,
    ROUND(avg_views) as avg_views
FROM hook_performance
ORDER BY niche, avg_views DESC;