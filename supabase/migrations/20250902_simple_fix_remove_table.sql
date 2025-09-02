-- Simplest fix: Remove the _removed_views table entirely since it's just documentation
-- This eliminates the RLS warning completely

-- 1. Drop the documentation table (it was just for tracking what we removed)
DROP TABLE IF EXISTS public._removed_views CASCADE;

-- 2. Fix the get_active_subscriptions function search_path
DROP FUNCTION IF EXISTS public.get_active_subscriptions();

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_active_subscriptions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_subscriptions() TO service_role;

-- 3. Ensure update_updated_at_column also has search_path set
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Add documentation as comments instead of a table
COMMENT ON FUNCTION public.get_active_subscriptions() IS 
'Replacement for active_subscriptions view (removed due to SECURITY DEFINER false positive). Returns all active and trialing subscriptions.';