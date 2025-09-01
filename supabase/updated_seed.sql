-- Updated seed data for Viralizes platform
-- This includes more realistic data based on the current app structure

-- Clear existing data (optional, remove if you want to append)
-- TRUNCATE niches, hook_patterns, viral_content, pattern_performance CASCADE;

-- Insert niches (7 industries as shown in app)
INSERT INTO niches (name, parent_category, content_count, avg_performance) VALUES
('Fitness', 'Health & Wellness', 3500, 12.5),
('Business/Finance', 'Professional', 2800, 15.3),
('Lifestyle', 'General', 4200, 14.7),
('Beauty/Skincare', 'Personal Care', 3100, 18.2),
('Food/Cooking', 'Food & Beverage', 3800, 16.5),
('Fashion', 'Style', 2900, 14.2),
('Tech/Gaming', 'Technology', 4500, 22.1)
ON CONFLICT (name) DO NOTHING;

-- Insert hook patterns with realistic viral ratios and sample sizes
INSERT INTO hook_patterns (template, category, occurrence_frequency, avg_viral_ratio, sample_size, confidence_level) VALUES
-- POV patterns
('POV: You''re {situation} and {unexpected_outcome}', 'Relatable', 1250, 18.5, 1250, 96.0),
('POV: When {relatable_situation} but {plot_twist}', 'Relatable', 980, 16.3, 980, 94.5),
('POV: You finally {achievement} and {ironic_result}', 'Relatable', 760, 14.8, 760, 93.0),

-- Nobody/Me patterns
('Nobody: ... Me: {quirky_behavior}', 'Humor', 1450, 17.2, 1450, 95.5),
('Nobody: Absolutely nobody: Me at 3am: {random_action}', 'Humor', 890, 15.6, 890, 93.5),
('No one: Not a soul: Me: {relatable_habit}', 'Humor', 670, 13.9, 670, 92.0),

-- Wait for it patterns
('Wait for it... {surprise_reveal}', 'Suspense', 2100, 24.3, 2100, 97.5),
('{setup}... Wait for it... {unexpected_outcome}', 'Suspense', 1560, 21.7, 1560, 96.5),
('Watch till the end... {hook_promise}', 'Suspense', 1340, 19.8, 1340, 95.0),

-- Educational/List patterns
('Things that {demographic} will never tell you about {topic}', 'Educational', 980, 16.8, 980, 94.0),
('{number} {items} you didn''t know you needed', 'Listicle', 1120, 18.2, 1120, 95.0),
('{number} signs you''re {characteristic}', 'Listicle', 850, 14.5, 850, 92.5),
('The {number} types of {category}', 'Listicle', 720, 13.2, 720, 91.0),

-- Series/Challenge patterns
('Day {number} of {challenge}', 'Series', 1850, 15.8, 1850, 94.5),
('Part {number} of {series_topic}', 'Series', 1230, 13.5, 1230, 93.0),
('Week {number} update: {progress_description}', 'Series', 890, 12.7, 890, 91.5),

-- When X hits different patterns
('When {relatable_situation} hits different', 'Relatable', 1670, 19.4, 1670, 96.0),
('That moment when {specific_scenario}', 'Relatable', 1340, 17.1, 1340, 94.5),
('When you realize {realization}', 'Relatable', 1120, 15.8, 1120, 93.5),

-- How-to patterns
('How to {achieve_goal} in {timeframe}', 'Tutorial', 1450, 16.9, 1450, 94.0),
('How I {achievement} (step by step)', 'Tutorial', 1180, 15.3, 1180, 93.0),
('The easiest way to {desired_outcome}', 'Tutorial', 960, 14.7, 960, 92.0),

-- Controversial/Opinion patterns
('{controversial_opinion} and here''s why', 'Opinion', 780, 22.8, 780, 95.5),
('Unpopular opinion: {statement}', 'Opinion', 920, 20.3, 920, 94.5),
('Hot take: {controversial_view}', 'Opinion', 650, 18.9, 650, 93.0),

-- Hack/Tip patterns
('The {adjective} {noun} hack that {benefit}', 'Tips', 1560, 17.8, 1560, 95.0),
('{platform} algorithm hack: {strategy}', 'Tips', 1230, 19.2, 1230, 94.5),
('This one trick will {promised_result}', 'Tips', 980, 16.4, 980, 93.0),

-- Transformation patterns
('Before and after {transformation_type}', 'Transformation', 1890, 23.5, 1890, 97.0),
('{time_period} transformation', 'Transformation', 1450, 21.2, 1450, 96.0),
('From {starting_point} to {end_point} in {timeframe}', 'Transformation', 1120, 18.7, 1120, 94.5),

-- Storytime patterns
('Storytime: {intriguing_premise}', 'Story', 890, 14.2, 890, 92.5),
('The time I {unexpected_experience}', 'Story', 760, 13.8, 760, 91.5),
('Let me tell you about {interesting_event}', 'Story', 650, 12.9, 650, 90.5),

-- Question/Engagement patterns
('Which {option} are you?', 'Engagement', 1340, 15.6, 1340, 93.5),
('Reply with {specific_response} if you {relatable_trait}', 'Engagement', 1120, 14.3, 1120, 92.0),
('What would you do if {scenario}?', 'Engagement', 980, 13.7, 980, 91.0)
ON CONFLICT DO NOTHING;

-- Insert viral content examples with realistic data
INSERT INTO viral_content (platform, url, views, followers_at_time, date_posted, niche, format_type, hook_text, visual_hook_desc, verbal_hook_text, written_hook_text) VALUES
-- Fitness content
('tiktok', 'https://tiktok.com/@fitnessguru/video/7291234567', 3500000, 150000, '2024-03-15', 'Fitness', 'video', 
 'POV: You finally hit a PR and the biggest guy in the gym gives you a fist bump', 
 'Gym footage with reaction shots', 'Emotional music buildup', 'Bold text overlay with perfect timing'),
 
('instagram', 'https://instagram.com/reel/C4x1234567', 2100000, 85000, '2024-03-14', 'Fitness', 'video',
 'Day 47 of 75 Hard and I finally understand why everyone quits on day 19',
 'Time-lapse transformation shots', 'Motivational voiceover', 'Day counter in corner'),

('tiktok', 'https://tiktok.com/@gymlife/video/7291567890', 4200000, 200000, '2024-03-13', 'Fitness', 'video',
 'Nobody: Me at the gym: Let me just add 5 more pounds even though my form is already breaking',
 'Shaky form demonstration', 'Comedic sound effects', 'Meme format text'),

-- Business/Finance content
('tiktok', 'https://tiktok.com/@entrepreneur/video/7292345678', 5800000, 320000, '2024-03-15', 'Business/Finance', 'video',
 'Your side hustle just made more than your 9-5 this month... wait for it',
 'Screen recording of earnings', 'Suspenseful audio', 'Revenue reveal at end'),

('instagram', 'https://instagram.com/reel/C4y2345678', 3200000, 145000, '2024-03-14', 'Business/Finance', 'video',
 '5 things millionaire mentors will never tell you about passive income',
 'Luxury lifestyle B-roll', 'Professional narration', 'Numbered list format'),

('tiktok', 'https://tiktok.com/@moneytips/video/7292678901', 2900000, 98000, '2024-03-13', 'Business/Finance', 'video',
 'How I made my first $10k online in 30 days (no course selling)',
 'Screen shares and receipts', 'Step-by-step explanation', 'Proof screenshots'),

-- Lifestyle content
('tiktok', 'https://tiktok.com/@lifestyle/video/7293456789', 6200000, 410000, '2024-03-15', 'Lifestyle', 'video',
 'POV: You wake up at 5am for your morning routine but spend 45 minutes watching productivity TikToks',
 'Aesthetic morning shots', 'Relatable inner monologue', 'Time stamps showing progression'),

('instagram', 'https://instagram.com/reel/C4z3456789', 3800000, 175000, '2024-03-14', 'Lifestyle', 'video',
 'When Sunday reset hits different and you meal prep, clean, and plan like a new person',
 'Satisfying cleaning montage', 'Trending audio', 'Before/after transitions'),

('tiktok', 'https://tiktok.com/@minimalist/video/7293789012', 2400000, 78000, '2024-03-13', 'Lifestyle', 'video',
 'Day 21 of dopamine detox and colors look brighter',
 'POV walking shots', 'Calm narration', 'Subtle color grading change'),

-- Beauty/Skincare content
('instagram', 'https://instagram.com/reel/C4a4567890', 7500000, 520000, '2024-03-15', 'Beauty/Skincare', 'video',
 'Used this $7 drugstore cream... wait for it... my aesthetician asked what I''ve been using',
 'Close-up skin texture shots', 'ASMR application sounds', 'Product reveal at end'),

('tiktok', 'https://tiktok.com/@skincare/video/7294567890', 4100000, 195000, '2024-03-14', 'Beauty/Skincare', 'video',
 '3 Korean skincare steps that transformed my skin in 2 weeks',
 'Split screen before/after', 'K-pop background music', 'Step-by-step graphics'),

('instagram', 'https://instagram.com/reel/C4b5678901', 2700000, 112000, '2024-03-13', 'Beauty/Skincare', 'video',
 'Nobody: Me: Mixing 5 different acids because more steps = better skin',
 'Chaotic product layering', 'Comedic voiceover', 'Warning text overlay'),

-- Food/Cooking content
('tiktok', 'https://tiktok.com/@foodie/video/7295678901', 8900000, 680000, '2024-03-15', 'Food/Cooking', 'video',
 'Tried making pasta from scratch... Gordon Ramsay commented',
 'Professional cooking shots', 'Dramatic music', 'Comment screenshot reveal'),

('instagram', 'https://instagram.com/reel/C4c6789012', 4500000, 215000, '2024-03-14', 'Food/Cooking', 'video',
 'POV: You meal prep on Sunday feeling like a chef, by Wednesday you''re ordering UberEats',
 'Time-lapse meal prep', 'Relatable narration', 'Day-by-day progression'),

('tiktok', 'https://tiktok.com/@homecook/video/7296789012', 3100000, 125000, '2024-03-13', 'Food/Cooking', 'video',
 'The freezer hack that makes meal prep actually sustainable',
 'Organization satisfying content', 'Quick tips voiceover', 'Label close-ups'),

-- Fashion content
('instagram', 'https://instagram.com/reel/C4d7890123', 5200000, 345000, '2024-03-15', 'Fashion', 'video',
 'Wore the same outfit formula for 30 days and people started asking for style advice',
 'Outfit transition montage', 'Fashion week audio', 'Day counter overlay'),

('tiktok', 'https://tiktok.com/@fashion/video/7297890123', 3600000, 165000, '2024-03-14', 'Fashion', 'video',
 'When thrift finds hit different and your $5 jacket gets more compliments than designer',
 'Thrift store footage to outfit', 'Trending sound', 'Price comparison overlay'),

('instagram', 'https://instagram.com/reel/C4e8901234', 2200000, 88000, '2024-03-13', 'Fashion', 'video',
 'The color matching hack that makes any outfit look expensive',
 'Side-by-side comparisons', 'Expert tips narration', 'Color wheel graphics'),

-- Tech/Gaming content
('tiktok', 'https://tiktok.com/@gamer/video/7298901234', 9500000, 780000, '2024-03-15', 'Tech/Gaming', 'video',
 'Changed this one setting... went from Bronze to Diamond in 2 weeks',
 'Gameplay highlights', 'Intense gaming music', 'Settings reveal at end'),

('instagram', 'https://instagram.com/reel/C4f9012345', 4800000, 285000, '2024-03-14', 'Tech/Gaming', 'video',
 'POV: You blame lag but deep down you know your reaction time peaked in 2018',
 'Funny fail compilation', 'Self-deprecating humor', 'Ping display overlay'),

('tiktok', 'https://tiktok.com/@techie/video/7299012345', 3400000, 142000, '2024-03-13', 'Tech/Gaming', 'video',
 'Day 60 of aim training 1 hour daily - friends think I''m cheating',
 'Before/after aim comparison', 'Progress narration', 'Stats improvement graphics')
ON CONFLICT DO NOTHING;

-- Insert pattern performance data (linking patterns to their performance over time)
INSERT INTO pattern_performance (pattern_id, time_period, viral_ratio, success_rate, sample_size, statistical_significance) 
SELECT 
    hp.id,
    period.time_period,
    hp.avg_viral_ratio + (RANDOM() * 4 - 2), -- Slight variation from average
    85.0 + (RANDOM() * 10), -- Success rate between 85-95%
    GREATEST(100, hp.sample_size / 4), -- Quarterly sample size
    0.94 + (RANDOM() * 0.05) -- High statistical significance
FROM hook_patterns hp
CROSS JOIN (
    VALUES 
    ('2024-Q1'),
    ('2024-Q2'),
    ('2024-Q3'),
    ('2024-Q4')
) AS period(time_period)
WHERE hp.sample_size > 500 -- Only patterns with significant data
LIMIT 100
ON CONFLICT DO NOTHING;

-- Update niches content_count based on viral_content entries
UPDATE niches n
SET content_count = (
    SELECT COUNT(*) 
    FROM viral_content vc 
    WHERE vc.niche = n.name
)
WHERE EXISTS (
    SELECT 1 
    FROM viral_content vc 
    WHERE vc.niche = n.name
);

-- Update hook_patterns occurrence_frequency based on similar patterns in viral_content
UPDATE hook_patterns hp
SET occurrence_frequency = GREATEST(
    occurrence_frequency,
    (SELECT COUNT(*) * 100 FROM viral_content WHERE hook_text ILIKE '%' || 
     SUBSTRING(hp.template FROM 1 FOR 10) || '%')
)
WHERE hp.template IS NOT NULL;