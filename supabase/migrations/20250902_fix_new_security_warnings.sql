-- Fix the two new security warnings

-- 1. Fix RLS disabled on _removed_views table
-- Since this is just a documentation table, we'll enable RLS and create a policy

-- Enable RLS on the table
ALTER TABLE public._removed_views ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to read the documentation
-- but only service role can insert/update/delete
CREATE POLICY "Anyone can read removed views documentation"
    ON public._removed_views
    FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Only service role can modify removed views documentation"
    ON public._removed_views
    FOR ALL
    TO service_role
    USING (true);

-- Alternative: If you don't need this table to be accessible at all, move it to a different schema
-- CREATE SCHEMA IF NOT EXISTS internal;
-- ALTER TABLE public._removed_views SET SCHEMA internal;

-- 2. Fix function search_path warning for get_active_subscriptions
-- Drop and recreate the function with a fixed search_path

DROP FUNCTION IF EXISTS public.get_active_subscriptions();

-- Recreate with fixed search_path
CREATE OR REPLACE FUNCTION public.get_active_subscriptions()
RETURNS SETOF public.user_subscriptions
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
    SELECT * FROM public.user_subscriptions 
    WHERE status IN ('active', 'trialing');
$$;

-- Grant permissions on the function
GRANT EXECUTE ON FUNCTION public.get_active_subscriptions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_subscriptions() TO service_role;

COMMENT ON FUNCTION public.get_active_subscriptions() IS 
'Replacement for active_subscriptions view. Returns all active and trialing subscriptions. Uses fixed search_path for security.';

-- 3. Also fix the original update_updated_at_column function if it still has the warning
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Verify the fixes
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = '_removed_views';