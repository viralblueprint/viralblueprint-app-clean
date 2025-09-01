-- Safe Supabase Security Fix Script
-- This version checks for function existence before applying fixes

-- ============================================
-- PART 1: Fix Function Search Path Warnings (Only for existing functions)
-- ============================================

-- Fix update_industry_stats function if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_industry_stats' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.update_industry_stats() SET search_path = public, pg_catalog;
        RAISE NOTICE 'Fixed search_path for update_industry_stats()';
    ELSE
        RAISE NOTICE 'Function update_industry_stats() not found - skipping';
    END IF;
END $$;

-- Fix refresh_platform_metrics function if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'refresh_platform_metrics' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.refresh_platform_metrics() SET search_path = public, pg_catalog;
        RAISE NOTICE 'Fixed search_path for refresh_platform_metrics()';
    ELSE
        RAISE NOTICE 'Function refresh_platform_metrics() not found - skipping';
    END IF;
END $$;

-- Fix update_updated_at_column function if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_catalog;
        RAISE NOTICE 'Fixed search_path for update_updated_at_column()';
    ELSE
        RAISE NOTICE 'Function update_updated_at_column() not found - skipping';
    END IF;
END $$;

-- Fix handle_new_user function if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace) THEN
        ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_catalog;
        RAISE NOTICE 'Fixed search_path for handle_new_user()';
    ELSE
        RAISE NOTICE 'Function handle_new_user() not found - skipping';
    END IF;
END $$;

-- Fix all upsert_video function overloads if they exist
DO $$
DECLARE
    func RECORD;
    count_fixed INTEGER := 0;
BEGIN
    FOR func IN 
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'upsert_video' 
        AND n.nspname = 'public'
    LOOP
        EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_catalog', func.func_signature);
        count_fixed := count_fixed + 1;
    END LOOP;
    
    IF count_fixed > 0 THEN
        RAISE NOTICE 'Fixed search_path for % upsert_video() function(s)', count_fixed;
    ELSE
        RAISE NOTICE 'Function upsert_video() not found - skipping';
    END IF;
END $$;

-- ============================================
-- PART 2: Move pg_trgm Extension to Extensions Schema
-- ============================================

DO $$
BEGIN
    -- Check if pg_trgm extension exists
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
        -- Create extensions schema if it doesn't exist
        CREATE SCHEMA IF NOT EXISTS extensions;
        
        -- Grant usage on extensions schema to necessary roles
        GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
        
        -- Move pg_trgm extension to extensions schema
        ALTER EXTENSION pg_trgm SET SCHEMA extensions;
        
        -- Update search_path for database to include extensions schema
        ALTER DATABASE postgres SET search_path TO public, extensions;
        
        RAISE NOTICE 'Successfully moved pg_trgm extension to extensions schema';
    ELSE
        RAISE NOTICE 'Extension pg_trgm not found - skipping';
    END IF;
END $$;

-- ============================================
-- PART 3: List All Functions That Need Search Path Fix
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Checking for functions that still need search_path configuration:';
END $$;

SELECT 
    n.nspname || '.' || p.proname || '()' as function_name,
    CASE 
        WHEN p.proconfig IS NULL OR NOT (p.proconfig::text[] @> ARRAY['search_path=public, pg_catalog'])
        THEN 'Needs search_path fix'
        ELSE 'OK'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND (p.proconfig IS NULL OR NOT (p.proconfig::text[] @> ARRAY['search_path=public, pg_catalog']))
ORDER BY n.nspname, p.proname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Security fixes applied (where applicable)!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Review the output above to see which functions were fixed';
    RAISE NOTICE '2. Go to Authentication → Policies → Enable "Leaked password protection"';
    RAISE NOTICE '3. Go to Authentication → Providers → Enable MFA options (TOTP recommended)';
    RAISE NOTICE '4. Run the Database Linter again to verify remaining warnings';
END $$;