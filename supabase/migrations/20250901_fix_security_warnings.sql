-- Drop existing objects to recreate them with proper security settings
DROP VIEW IF EXISTS public.active_subscriptions;
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate function with explicit search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Recreate view without SECURITY DEFINER
CREATE VIEW public.active_subscriptions 
WITH (security_invoker = true) AS
SELECT 
  user_id,
  plan_id,
  stripe_customer_id,
  stripe_subscription_id,
  created_at,
  updated_at
FROM public.user_subscriptions
WHERE status = 'active';

-- Re-grant permissions
GRANT SELECT ON public.active_subscriptions TO authenticated;