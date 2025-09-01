-- Setup script for new Supabase instance
-- Run this in your Supabase SQL Editor

-- 1. Create the viral_videos table
CREATE TABLE IF NOT EXISTS viral_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT UNIQUE NOT NULL,
    views BIGINT NOT NULL,
    niche TEXT NOT NULL,
    visual_hook TEXT,
    verbal_hook TEXT,
    written_hook TEXT,
    video_created_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_niche ON viral_videos(niche);
CREATE INDEX IF NOT EXISTS idx_videos_views ON viral_videos(views DESC);
CREATE INDEX IF NOT EXISTS idx_videos_date ON viral_videos(video_created_date);

-- 3. Insert test data
INSERT INTO viral_videos (url, views, niche, visual_hook, verbal_hook, written_hook, video_created_date) 
VALUES 
-- Fitness content
('https://tiktok.com/@fitguru/video/test1', 5200000, 'Fitness', 
 'Quick cuts between before/after shots', 
 'POV: You finally hit your PR and the gym bros notice',
 'DAY 47 OF 75 HARD',
 '2024-03-15'),

('https://instagram.com/reel/fitness-test1', 3100000, 'Fitness',
 'Time-lapse transformation montage',
 'Nobody asked but here is how I lost 30lbs',
 'Wait for it...',
 '2024-03-14'),

-- Business/Finance content
('https://tiktok.com/@entrepreneur/video/test1', 8900000, 'Business/Finance',
 'Screen recording of earnings dashboard',
 'How I made $10k in 30 days with no experience',
 '$0 to $10,000 in 30 DAYS',
 '2024-03-13'),

('https://instagram.com/reel/business-test1', 4200000, 'Business/Finance',
 'Luxury car and laptop lifestyle shots',
 'The side hustle nobody talks about',
 '3 income streams you need in 2024',
 '2024-03-12'),

-- Lifestyle content
('https://tiktok.com/@lifestyle/video/test1', 6700000, 'Lifestyle',
 'Aesthetic morning routine montage',
 'POV: You are becoming that girl',
 '5AM MORNING ROUTINE',
 '2024-03-11'),

-- Beauty/Skincare content
('https://tiktok.com/@skincare/video/test1', 7300000, 'Beauty/Skincare',
 'Close-up skin texture before/after',
 'The Korean skincare secret that changed my skin',
 'GLASS SKIN IN 7 DAYS',
 '2024-03-10'),

-- Food/Cooking content
('https://tiktok.com/@foodie/video/test1', 9500000, 'Food/Cooking',
 'Overhead shot of ingredients coming together',
 'Gordon Ramsay would be proud',
 '2-MINUTE PASTA HACK',
 '2024-03-09'),

-- Fashion content
('https://tiktok.com/@fashion/video/test1', 5800000, 'Fashion',
 'Outfit transition with spin effect',
 'When you find the perfect thrift piece',
 'OUTFIT IDEAS FOR YOUR BODY TYPE',
 '2024-03-08'),

-- Tech/Gaming content
('https://tiktok.com/@gamer/video/test1', 11200000, 'Tech/Gaming',
 'Gameplay clutch moment in slow-mo',
 'This setting doubled my FPS',
 'INSANE 1v5 CLUTCH',
 '2024-03-07')

ON CONFLICT (url) DO UPDATE SET
  views = EXCLUDED.views,
  niche = EXCLUDED.niche,
  visual_hook = EXCLUDED.visual_hook,
  verbal_hook = EXCLUDED.verbal_hook,
  written_hook = EXCLUDED.written_hook,
  video_created_date = EXCLUDED.video_created_date;

-- 4. Verify the data was inserted
SELECT 
  niche,
  COUNT(*) as video_count,
  AVG(views) as avg_views,
  MAX(views) as max_views
FROM viral_videos
GROUP BY niche
ORDER BY avg_views DESC;