-- Fix Supabase Performance Warnings
-- This script optimizes RLS policies and removes duplicate indexes

-- ============================================
-- PART 1: Fix RLS Performance Issues
-- ============================================
-- Replace auth.uid() with (select auth.uid()) to prevent re-evaluation for each row

-- Fix albums table RLS policies
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own albums" ON public.albums;
    DROP POLICY IF EXISTS "Users can create own albums" ON public.albums;
    DROP POLICY IF EXISTS "Users can update own albums" ON public.albums;
    DROP POLICY IF EXISTS "Users can delete own albums" ON public.albums;
    
    -- Recreate with optimized auth.uid() calls
    CREATE POLICY "Users can view own albums" ON public.albums
        FOR SELECT USING (user_id = (SELECT auth.uid()));
    
    CREATE POLICY "Users can create own albums" ON public.albums
        FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));
    
    CREATE POLICY "Users can update own albums" ON public.albums
        FOR UPDATE USING (user_id = (SELECT auth.uid()));
    
    CREATE POLICY "Users can delete own albums" ON public.albums
        FOR DELETE USING (user_id = (SELECT auth.uid()));
    
    RAISE NOTICE 'Fixed RLS policies for albums table';
END $$;

-- Fix saved_videos table RLS policies
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own saved videos" ON public.saved_videos;
    DROP POLICY IF EXISTS "Users can save videos to own albums" ON public.saved_videos;
    DROP POLICY IF EXISTS "Users can delete own saved videos" ON public.saved_videos;
    
    -- Recreate with optimized auth.uid() calls
    CREATE POLICY "Users can view own saved videos" ON public.saved_videos
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.albums 
                WHERE albums.id = saved_videos.album_id 
                AND albums.user_id = (SELECT auth.uid())
            )
        );
    
    CREATE POLICY "Users can save videos to own albums" ON public.saved_videos
        FOR INSERT WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.albums 
                WHERE albums.id = saved_videos.album_id 
                AND albums.user_id = (SELECT auth.uid())
            )
        );
    
    CREATE POLICY "Users can delete own saved videos" ON public.saved_videos
        FOR DELETE USING (
            EXISTS (
                SELECT 1 FROM public.albums 
                WHERE albums.id = saved_videos.album_id 
                AND albums.user_id = (SELECT auth.uid())
            )
        );
    
    RAISE NOTICE 'Fixed RLS policies for saved_videos table';
END $$;

-- ============================================
-- PART 2: Remove Duplicate Index
-- ============================================

-- Check which duplicate index to keep (usually keep the first one)
DO $$
DECLARE
    index_to_drop TEXT;
BEGIN
    -- Check if both indexes exist
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_viral_videos_hooktype' AND schemaname = 'public') AND
       EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_viral_videos_hooktype_text' AND schemaname = 'public') THEN
        
        -- Drop the second duplicate index
        DROP INDEX IF EXISTS public.idx_viral_videos_hooktype_text;
        RAISE NOTICE 'Dropped duplicate index: idx_viral_videos_hooktype_text';
    ELSE
        RAISE NOTICE 'Duplicate indexes not found or already resolved';
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify RLS policies are using (SELECT auth.uid())
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%(SELECT auth.uid())%' THEN 'Needs optimization'
        WHEN with_check::text LIKE '%auth.uid()%' AND with_check::text NOT LIKE '%(SELECT auth.uid())%' THEN 'Needs optimization'
        ELSE 'OK'
    END as status
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('albums', 'saved_videos');

-- Verify duplicate indexes are removed
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename = 'viral_videos'
AND indexname LIKE '%hooktype%'
ORDER BY indexname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Performance optimizations applied!';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed:';
    RAISE NOTICE '- Optimized RLS policies for albums table';
    RAISE NOTICE '- Optimized RLS policies for saved_videos table';
    RAISE NOTICE '- Removed duplicate index on viral_videos table';
    RAISE NOTICE '';
    RAISE NOTICE 'Run the Database Linter again to verify all warnings are resolved';
END $$;