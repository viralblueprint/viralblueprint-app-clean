-- Complete Supabase Security Fix Script
-- This script addresses all security warnings in your Supabase project
-- Run this entire script in your Supabase SQL Editor

-- ============================================
-- PART 1: Fix Function Search Path Warnings
-- ============================================

-- Fix update_industry_stats function
ALTER FUNCTION public.update_industry_stats() 
SET search_path = public, pg_catalog;

-- Fix refresh_platform_metrics function  
ALTER FUNCTION public.refresh_platform_metrics() 
SET search_path = public, pg_catalog;

-- Fix update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public, pg_catalog;

-- Fix handle_new_user function
ALTER FUNCTION public.handle_new_user() 
SET search_path = public, pg_catalog;

-- Fix all upsert_video function overloads (handles multiple versions)
DO $$
DECLARE
    func RECORD;
BEGIN
    FOR func IN 
        SELECT p.oid::regprocedure AS func_signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname = 'upsert_video' 
        AND n.nspname = 'public'
    LOOP
        EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_catalog', func.func_signature);
    END LOOP;
END $$;

-- ============================================
-- PART 2: Move pg_trgm Extension to Extensions Schema
-- ============================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move pg_trgm extension to extensions schema
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Update search_path for database to include extensions schema
ALTER DATABASE postgres SET search_path TO public, extensions;

-- ============================================
-- PART 3: Recreate Any Text Search Indexes
-- ============================================

-- If you have any text search indexes using pg_trgm, they need to be recreated
-- Check for existing indexes that might use pg_trgm
DO $$
DECLARE
    idx RECORD;
BEGIN
    -- Log indexes that might need recreation
    FOR idx IN 
        SELECT schemaname, tablename, indexname, indexdef
        FROM pg_indexes
        WHERE indexdef LIKE '%gin_trgm_ops%' 
           OR indexdef LIKE '%gist_trgm_ops%'
    LOOP
        RAISE NOTICE 'Index % on %.% may need to be recreated', idx.indexname, idx.schemaname, idx.tablename;
    END LOOP;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify all functions have search_path set
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    p.prosecdef as security_definer,
    p.proconfig as config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
ORDER BY n.nspname, p.proname;

-- Check extension location
SELECT 
    extname,
    nspname as schema_name
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname = 'pg_trgm';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Security fixes applied successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Go to Authentication → Policies → Enable "Leaked password protection"';
    RAISE NOTICE '2. Go to Authentication → Providers → Enable MFA options (TOTP recommended)';
    RAISE NOTICE '3. Run the Database Linter again to verify all warnings are resolved';
END $$;