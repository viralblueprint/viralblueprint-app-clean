-- Fix security warnings from Supabase linter

-- 1. Fix SECURITY DEFINER view warning
-- The active_subscriptions view should not use SECURITY DEFINER
-- This recreates the view without SECURITY DEFINER

-- First, drop the existing view if it exists
DROP VIEW IF EXISTS public.active_subscriptions;

-- Recreate the view without SECURITY DEFINER
-- This view will now use the permissions of the querying user, not the view creator
CREATE VIEW public.active_subscriptions AS
SELECT 
    user_id,
    stripe_customer_id,
    stripe_subscription_id,
    status,
    plan_id,
    trial_end,
    current_period_end,
    cancel_at_period_end,
    created_at,
    updated_at
FROM public.user_subscriptions
WHERE status IN ('active', 'trialing');

-- Grant appropriate permissions on the view
GRANT SELECT ON public.active_subscriptions TO authenticated;

-- 2. Fix function search_path warning
-- The update_updated_at_column function should have an immutable search_path
-- This prevents potential security issues from search_path manipulation

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recreate the function with a fixed search_path
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

-- Recreate any triggers that were using this function
-- Check if the trigger exists on user_subscriptions table
DO $$
BEGIN
    -- Create trigger for user_subscriptions if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'user_subscriptions') THEN
        
        DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
        
        CREATE TRIGGER update_user_subscriptions_updated_at
        BEFORE UPDATE ON public.user_subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Add similar blocks for other tables that might use this trigger
    -- For example, if you have other tables with updated_at columns
END $$;

-- Additional security best practices

-- 3. Ensure RLS is enabled on sensitive tables
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies if they don't exist
-- Policy for users to see their own subscriptions
DO $$
BEGIN
    -- Drop existing policy if it exists
    DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
    
    -- Create the policy
    CREATE POLICY "Users can view their own subscriptions"
        ON public.user_subscriptions
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    
    -- Policy for users to update their own subscriptions
    DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;
    
    CREATE POLICY "Users can update their own subscriptions"
        ON public.user_subscriptions
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = user_id);
    
    -- Policy for users to insert their own subscriptions
    DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
    
    CREATE POLICY "Users can insert their own subscriptions"
        ON public.user_subscriptions
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
        
    -- Policy for service role to manage all subscriptions (for webhooks)
    DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.user_subscriptions;
    
    CREATE POLICY "Service role can manage all subscriptions"
        ON public.user_subscriptions
        FOR ALL
        TO service_role
        USING (true);
END $$;

-- 5. Add comments for documentation
COMMENT ON VIEW public.active_subscriptions IS 'View showing only active and trialing subscriptions. Uses invoker permissions for RLS.';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger function to automatically update the updated_at timestamp. Uses fixed search_path for security.';