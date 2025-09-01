-- Add platform column to viral_videos table
ALTER TABLE viral_videos 
ADD COLUMN platform VARCHAR(50);

-- Update existing rows to set platform based on URL
UPDATE viral_videos 
SET platform = 
  CASE 
    WHEN url LIKE '%instagram.com%' THEN 'instagram'
    WHEN url LIKE '%tiktok.com%' THEN 'tiktok'
    WHEN url LIKE '%youtube.com%' OR url LIKE '%youtu.be%' THEN 'youtube'
    ELSE 'other'
  END
WHERE platform IS NULL;

-- Optional: Add an index for better query performance
CREATE INDEX idx_viral_videos_platform ON viral_videos(platform);