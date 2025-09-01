-- Fix Supabase Security Warnings
-- Run this in your Supabase SQL editor

-- 1. Fix function search_path warnings by setting explicit search paths
-- This prevents potential security issues with function name resolution

-- Fix update_industry_stats function
ALTER FUNCTION public.update_industry_stats() 
SET search_path = public, pg_catalog;

-- Fix refresh_platform_metrics function
ALTER FUNCTION public.refresh_platform_metrics() 
SET search_path = public, pg_catalog;

-- Fix update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() 
SET search_path = public, pg_catalog;

-- Fix all upsert_video function overloads
-- Note: There appear to be multiple versions, we'll fix all of them
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

-- Fix handle_new_user function
ALTER FUNCTION public.handle_new_user() 
SET search_path = public, pg_catalog;

-- 2. Move pg_trgm extension from public schema to extensions schema
-- First create the extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move pg_trgm extension to extensions schema
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Update search_path for database to include extensions schema
-- This ensures the extension functions are still accessible
ALTER DATABASE postgres SET search_path TO public, extensions;

-- If you have any indexes using pg_trgm, you may need to recreate them
-- For example, if you have text search indexes:
-- DROP INDEX IF EXISTS your_index_name;
-- CREATE INDEX your_index_name ON your_table USING gin (your_column extensions.gin_trgm_ops);

-- Note: For the Auth warnings (leaked password protection and MFA), 
-- these need to be configured in the Supabase dashboard:
-- 1. Go to Authentication > Policies
-- 2. Enable "Leaked password protection" 
-- 3. Go to Authentication > Providers
-- 4. Enable additional MFA methods (TOTP, SMS, etc.)