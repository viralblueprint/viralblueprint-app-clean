-- Fix performance warnings in RLS policies

-- Step 1: Drop all existing RLS policies on user_subscriptions
-- We have duplicates and they're using inefficient auth.uid() calls
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.user_subscriptions;

-- Step 2: Recreate policies with optimized auth.uid() calls
-- Using (SELECT auth.uid()) instead of auth.uid() prevents re-evaluation for each row

-- Policy for users to SELECT their own subscriptions
CREATE POLICY "users_select_own"
    ON public.user_subscriptions
    FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- Policy for users to INSERT their own subscriptions
CREATE POLICY "users_insert_own"
    ON public.user_subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Policy for users to UPDATE their own subscriptions
CREATE POLICY "users_update_own"
    ON public.user_subscriptions
    FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- Policy for users to DELETE their own subscriptions (if needed)
CREATE POLICY "users_delete_own"
    ON public.user_subscriptions
    FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- Policy for service role to manage all subscriptions
CREATE POLICY "service_role_all"
    ON public.user_subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Step 3: Add comments for documentation
COMMENT ON POLICY "users_select_own" ON public.user_subscriptions IS 
'Optimized policy: Users can view their own subscriptions';

COMMENT ON POLICY "users_insert_own" ON public.user_subscriptions IS 
'Optimized policy: Users can insert their own subscriptions';

COMMENT ON POLICY "users_update_own" ON public.user_subscriptions IS 
'Optimized policy: Users can update their own subscriptions';

COMMENT ON POLICY "users_delete_own" ON public.user_subscriptions IS 
'Optimized policy: Users can delete their own subscriptions';

COMMENT ON POLICY "service_role_all" ON public.user_subscriptions IS 
'Service role has full access for webhook operations';

-- Step 4: Verify the policies are created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'user_subscriptions'
ORDER BY policyname;