-- Migration script to update existing data to new industry categories
-- Run this AFTER the updated_schema.sql if you have existing data

-- Update Business variations
UPDATE viral_videos 
SET industry = 'Business' 
WHERE industry IN ('Business/Finance', 'Business/Entrepreneur', 'Business & Finance');

-- Update Tech variations
UPDATE viral_videos 
SET industry = 'Tech' 
WHERE industry IN ('Tech/Gaming', 'Tech/Productivity', 'Tech & Gaming');

-- Update Fitness variations
UPDATE viral_videos 
SET industry = 'Fitness' 
WHERE industry IN ('Fitness & Health', 'Fitness/Health');

-- Update Beauty, Fashion, Travel to Lifestyle
UPDATE viral_videos 
SET industry = 'Lifestyle' 
WHERE industry IN ('Beauty', 'Fashion', 'Travel', 'Beauty/Skincare', 'Fashion & Style', 'Beauty & Skincare');

-- Verify the update
SELECT industry, COUNT(*) as count 
FROM viral_videos 
GROUP BY industry 
ORDER BY industry;

-- The only industries should now be:
-- 'Fitness'
-- 'Business'
-- 'Lifestyle'
-- 'Tech'