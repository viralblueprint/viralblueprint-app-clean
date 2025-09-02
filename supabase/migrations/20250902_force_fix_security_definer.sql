-- Force fix for SECURITY DEFINER view warning
-- This ensures the view is completely removed and recreated properly

-- Step 1: Drop the view completely (CASCADE to remove dependencies)
DROP VIEW IF EXISTS public.active_subscriptions CASCADE;

-- Step 2: Recreate the view explicitly with SECURITY INVOKER (the default, but we'll be explicit)
-- SECURITY INVOKER means the view uses the permissions of the user executing the query
CREATE OR REPLACE VIEW public.active_subscriptions 
WITH (security_invoker = true) AS
SELECT 
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    status,
    plan_id,
    created_at,
    updated_at
FROM public.user_subscriptions
WHERE status IN ('active', 'trialing');

-- Step 3: Grant permissions
GRANT SELECT ON public.active_subscriptions TO authenticated;
GRANT SELECT ON public.active_subscriptions TO anon;

-- Step 4: Verify the view doesn't have SECURITY DEFINER
-- You can run this query to check:
-- SELECT schemaname, viewname, viewowner, definition 
-- FROM pg_views 
-- WHERE viewname = 'active_subscriptions';

-- Alternative approach: If the above doesn't work, try creating a completely new view
-- with a different name and then rename it

-- Drop the problematic view
-- DROP VIEW IF EXISTS public.active_subscriptions CASCADE;

-- Create a new view with a temporary name
-- CREATE VIEW public.temp_active_subscriptions AS
-- SELECT 
--     user_id,
--     stripe_customer_id,
--     stripe_subscription_id,
--     status,
--     plan_id,
--     created_at,
--     updated_at
-- FROM public.user_subscriptions
-- WHERE status IN ('active', 'trialing');

-- Rename the new view to the original name
-- ALTER VIEW public.temp_active_subscriptions RENAME TO active_subscriptions;

-- Grant permissions
-- GRANT SELECT ON public.active_subscriptions TO authenticated;
-- GRANT SELECT ON public.active_subscriptions TO anon;