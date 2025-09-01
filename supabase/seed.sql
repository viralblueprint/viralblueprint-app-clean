-- Seed data for development

-- Insert niches
INSERT INTO niches (name, parent_category, content_count, avg_performance) VALUES
('Fitness', 'Health', 1500, 8.5),
('Business/Finance', 'Professional', 2000, 12.3),
('Lifestyle', 'General', 3000, 15.7),
('Beauty/Skincare', 'Personal Care', 2500, 18.2),
('Food/Cooking', 'Food', 3500, 16.5),
('Fashion', 'Style', 2800, 14.2),
('Tech/Gaming', 'Technology', 4000, 22.1);

-- Insert hook patterns
INSERT INTO hook_patterns (template, category, occurrence_frequency, avg_viral_ratio, sample_size, confidence_level) VALUES
('POV: You''re {situation} and {unexpected_outcome}', 'Relatable', 450, 15.8, 450, 95.0),
('Nobody: ... Me: {quirky_behavior}', 'Humor', 380, 12.3, 380, 92.0),
('Wait for it... {surprise_reveal}', 'Suspense', 520, 18.5, 520, 96.5),
('Things that {demographic} will never tell you about {topic}', 'Educational', 290, 14.2, 290, 89.0),
('{number} {items} you didn''t know you needed', 'Listicle', 410, 16.7, 410, 94.0),
('Day {number} of {challenge}', 'Series', 350, 11.5, 350, 91.0),
('When {relatable_situation} hits different', 'Relatable', 470, 17.2, 470, 95.5),
('How to {achieve_goal} in {timeframe}', 'Tutorial', 320, 13.8, 320, 90.5),
('{controversial_opinion} and here''s why', 'Opinion', 280, 20.3, 280, 88.0),
('The {adjective} {noun} hack that {benefit}', 'Tips', 390, 15.1, 390, 93.0);

-- Insert viral content samples
INSERT INTO viral_content (platform, url, views, followers_at_time, date_posted, niche, format_type, hook_text, visual_hook_desc, verbal_hook_text, written_hook_text) VALUES
('tiktok', 'https://tiktok.com/example1', 2500000, 50000, '2024-01-15', 'Lifestyle', 'video', 'POV: You''re at a family dinner and your mom brings up your love life', 'Quick cuts between reactions', 'Dramatic music buildup', 'Bold text overlay'),
('instagram', 'https://instagram.com/example2', 1800000, 100000, '2024-01-20', 'Fitness', 'carousel', '5 exercises you didn''t know you needed for abs', 'Before/after transformation', NULL, 'Numbered list format'),
('tiktok', 'https://tiktok.com/example3', 3200000, 75000, '2024-01-25', 'Tech/Gaming', 'video', 'Wait for it... this phone feature will blow your mind', 'Slow reveal with zoom', 'Suspenseful audio', 'Timer countdown'),
('instagram', 'https://instagram.com/example4', 950000, 30000, '2024-02-01', 'Food/Cooking', 'video', 'The garlic peeling hack that saves 10 minutes', 'Close-up demonstration', 'ASMR sounds', 'Step numbers overlay'),
('tiktok', 'https://tiktok.com/example5', 4100000, 120000, '2024-02-05', 'Fashion', 'video', 'Day 7 of wearing only thrifted outfits', 'Outfit transition montage', 'Trending audio', 'Day counter graphic'),
('youtube', 'https://youtube.com/example6', 5500000, 200000, '2024-02-10', 'Tech/Gaming', 'video', 'Nobody: ... Me: Building an entire city in Minecraft at 3am', 'Timelapse footage', 'Background commentary', 'Meme format text'),
('tiktok', 'https://tiktok.com/example7', 2900000, 60000, '2024-02-15', 'Business/Finance', 'video', 'Things that successful entrepreneurs will never tell you', 'Whiteboard illustrations', 'Conversational tone', 'Bullet points'),
('instagram', 'https://instagram.com/example8', 1600000, 45000, '2024-02-20', 'Lifestyle', 'carousel', 'How to create a morning routine that actually works', 'Step-by-step visuals', NULL, 'Time-based graphics'),
('tiktok', 'https://tiktok.com/example9', 3800000, 85000, '2024-02-25', 'Business/Finance', 'video', 'Controversial opinion: Saving money is easier than making it and here''s why', 'Graph animations', 'Confident delivery', 'Bold statement opener'),
('instagram', 'https://instagram.com/example10', 1200000, 25000, '2024-03-01', 'Beauty/Skincare', 'video', 'When your skincare routine hits different on a budget', 'Before/after reveal', 'Upbeat music', 'Product close-ups');

-- Insert pattern performance data
INSERT INTO pattern_performance (pattern_id, time_period, viral_ratio, success_rate, sample_size, statistical_significance) 
SELECT 
    hp.id,
    '2024-Q1',
    hp.avg_viral_ratio + (RANDOM() * 5 - 2.5),
    85.0 + (RANDOM() * 10),
    hp.sample_size,
    0.95 + (RANDOM() * 0.04)
FROM hook_patterns hp
LIMIT 10;