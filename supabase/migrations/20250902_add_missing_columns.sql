-- Add missing columns to user_subscriptions table
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS current_period_end timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_end timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;