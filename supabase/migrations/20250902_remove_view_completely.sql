-- Option: Remove the view completely if it's not being used
-- This eliminates the security warning entirely

-- Step 1: Drop the problematic view
DROP VIEW IF EXISTS public.active_subscriptions CASCADE;

-- Step 2: If you need the functionality, create a function instead
-- Functions can be more secure and flexible than views

CREATE OR REPLACE FUNCTION public.get_active_subscriptions(p_user_id uuid DEFAULT NULL)
RETURNS TABLE (
    user_id uuid,
    stripe_customer_id text,
    stripe_subscription_id text,
    status text,
    plan_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.user_id,
        us.stripe_customer_id,
        us.stripe_subscription_id,
        us.status,
        us.plan_id,
        us.created_at,
        us.updated_at
    FROM public.user_subscriptions us
    WHERE us.status IN ('active', 'trialing')
    AND (p_user_id IS NULL OR us.user_id = p_user_id);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_active_subscriptions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_subscriptions(uuid) TO service_role;

-- Usage examples:
-- Get all active subscriptions (for admin/service role):
-- SELECT * FROM get_active_subscriptions();

-- Get active subscription for specific user:
-- SELECT * FROM get_active_subscriptions('user-uuid-here');

-- Get current user's active subscription:
-- SELECT * FROM get_active_subscriptions(auth.uid());

COMMENT ON FUNCTION public.get_active_subscriptions IS 
'Function to retrieve active and trialing subscriptions. More secure than a view with SECURITY DEFINER.';