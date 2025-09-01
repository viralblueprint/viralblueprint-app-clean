-- Add displayUrl column to viral_videos table
ALTER TABLE viral_videos 
ADD COLUMN IF NOT EXISTS displayUrl TEXT;

-- You can optionally set a default value or copy from thumbnail initially
-- UPDATE viral_videos SET displayUrl = thumbnail WHERE displayUrl IS NULL;