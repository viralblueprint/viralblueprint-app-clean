-- Add followers column to viral_videos table
ALTER TABLE viral_videos 
ADD COLUMN IF NOT EXISTS followers INTEGER;

-- Optional: Set a default value for existing rows (you can remove this if not needed)
-- UPDATE viral_videos SET followers = 0 WHERE followers IS NULL;