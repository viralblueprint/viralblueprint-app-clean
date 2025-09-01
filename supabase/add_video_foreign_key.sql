-- Add foreign key constraint to saved_videos table
-- This ensures video_id references a valid viral_videos id

ALTER TABLE saved_videos
ADD CONSTRAINT fk_saved_videos_video
FOREIGN KEY (video_id) 
REFERENCES viral_videos(id) 
ON DELETE CASCADE;