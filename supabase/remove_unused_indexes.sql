-- Remove Unused Indexes (Optional)
-- Only run this if you're certain these indexes aren't needed
-- INFO level warnings are not critical

-- Review before removing - these indexes might be useful for:
-- - Future queries
-- - Seasonal traffic patterns
-- - Features not yet fully implemented

-- Uncomment the lines below to remove specific unused indexes:

-- Viral videos indexes
-- DROP INDEX IF EXISTS public.idx_viral_videos_hooktype;
-- DROP INDEX IF EXISTS public.idx_viral_videos_timestamp;
-- DROP INDEX IF EXISTS public.idx_viral_videos_dateinserted;
-- DROP INDEX IF EXISTS public.idx_viral_videos_inputurl_text;

-- Saved videos indexes
-- DROP INDEX IF EXISTS public.idx_saved_videos_video_id;
-- DROP INDEX IF EXISTS public.idx_saved_videos_saved_at;

-- Albums indexes
-- DROP INDEX IF EXISTS public.idx_albums_created_at;

-- Note: Consider keeping indexes on:
-- - Foreign keys (like video_id) for join performance
-- - Timestamp fields if you plan to sort/filter by date
-- - Fields used in WHERE clauses of your queries