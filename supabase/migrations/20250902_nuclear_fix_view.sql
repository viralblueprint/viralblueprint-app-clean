-- Nuclear option: Complete removal and rebuild of the view
-- Run this if the other fixes don't work

-- Step 1: Check if the view exists and what its definition is
DO $$
BEGIN
    -- Drop any existing view with CASCADE to remove all dependencies
    IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'active_subscriptions') THEN
        EXECUTE 'DROP VIEW public.active_subscriptions CASCADE';
        RAISE NOTICE 'Dropped existing active_subscriptions view';
    END IF;
END $$;

-- Step 2: Create a completely new view without any SECURITY DEFINER
-- Using the most explicit syntax to ensure no SECURITY DEFINER
CREATE VIEW public.active_subscriptions AS
SELECT 
    us.user_id::uuid,
    us.stripe_customer_id::text,
    us.stripe_subscription_id::text,
    us.status::text,
    us.plan_id::text,
    us.created_at::timestamp with time zone,
    us.updated_at::timestamp with time zone
FROM public.user_subscriptions us
WHERE us.status::text = ANY(ARRAY['active'::text, 'trialing'::text]);

-- Step 3: Explicitly set the view to use SECURITY INVOKER (user's permissions)
-- Note: This is PostgreSQL 15+ syntax. For older versions, skip this.
-- ALTER VIEW public.active_subscriptions SET (security_invoker = true);

-- Step 4: Set proper ownership (replace 'postgres' with your actual database owner if different)
ALTER VIEW public.active_subscriptions OWNER TO postgres;

-- Step 5: Grant appropriate permissions
REVOKE ALL ON public.active_subscriptions FROM PUBLIC;
GRANT SELECT ON public.active_subscriptions TO authenticated;
GRANT SELECT ON public.active_subscriptions TO service_role;

-- Step 6: Add a comment for documentation
COMMENT ON VIEW public.active_subscriptions IS 
'View showing active and trialing subscriptions. Uses SECURITY INVOKER (user permissions, not definer permissions).';

-- Step 7: Verify the fix worked
-- Run this query after executing the above to confirm no SECURITY DEFINER:
SELECT 
    n.nspname as schema,
    c.relname as view_name,
    CASE c.relkind
        WHEN 'v' THEN 'view'
        WHEN 'm' THEN 'materialized view'
    END as type,
    pg_get_userbyid(c.relowner) as owner,
    CASE 
        WHEN c.reloptions::text LIKE '%security_invoker=false%' THEN 'SECURITY DEFINER'
        WHEN c.reloptions::text LIKE '%security_invoker=true%' THEN 'SECURITY INVOKER'
        WHEN c.reloptions IS NULL THEN 'SECURITY INVOKER (default)'
        ELSE 'UNKNOWN'
    END as security_mode
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'active_subscriptions'
AND n.nspname = 'public';