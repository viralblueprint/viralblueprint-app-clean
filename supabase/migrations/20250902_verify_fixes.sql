-- Verification script to check all fixes are applied correctly

-- 1. Check that no duplicate policies exist
SELECT 
    'Duplicate Policy Check' as check_type,
    tablename,
    cmd as action,
    string_agg(policyname, ', ') as policy_names,
    count(*) as policy_count,
    CASE 
        WHEN count(*) > 1 THEN '❌ DUPLICATE POLICIES FOUND'
        ELSE '✅ No duplicates'
    END as status
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'user_subscriptions'
AND roles::text LIKE '%authenticated%'
GROUP BY tablename, cmd
HAVING count(*) > 1;

-- 2. Check that policies use optimized (SELECT auth.uid()) pattern
SELECT 
    'Auth Optimization Check' as check_type,
    policyname,
    CASE 
        WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid())%' THEN '❌ NOT OPTIMIZED - uses auth.uid()'
        WHEN qual LIKE '%(SELECT auth.uid())%' THEN '✅ OPTIMIZED - uses (SELECT auth.uid())'
        WHEN qual IS NULL THEN '✅ No auth check needed'
        ELSE '✅ OK'
    END as optimization_status,
    qual as policy_definition
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'user_subscriptions';

-- 3. Check that the problematic view doesn't exist
SELECT 
    'View Check' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_views 
            WHERE schemaname = 'public' 
            AND viewname = 'active_subscriptions'
        ) THEN '❌ active_subscriptions view still exists'
        ELSE '✅ active_subscriptions view removed'
    END as status;

-- 4. Check that functions have search_path set
SELECT 
    'Function Search Path Check' as check_type,
    proname as function_name,
    CASE 
        WHEN prosecdef = true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security_type,
    CASE 
        WHEN proconfig::text LIKE '%search_path%' THEN '✅ Has search_path set'
        ELSE '❌ Missing search_path'
    END as search_path_status,
    proconfig as config
FROM pg_proc
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname IN ('update_updated_at_column', 'get_active_subscriptions');

-- 5. Summary of all policies
SELECT 
    'Policy Summary' as check_type,
    tablename,
    policyname,
    cmd as action,
    roles::text as applies_to,
    permissive as is_permissive
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'user_subscriptions'
ORDER BY tablename, cmd, policyname;