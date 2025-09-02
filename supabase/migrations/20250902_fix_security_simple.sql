-- Simple fixes for Supabase security warnings

-- Fix 1: Remove SECURITY DEFINER from active_subscriptions view
DROP VIEW IF EXISTS public.active_subscriptions;

CREATE VIEW public.active_subscriptions AS
SELECT * FROM public.user_subscriptions
WHERE status IN ('active', 'trialing');

-- Fix 2: Add search_path to update_updated_at_column function
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