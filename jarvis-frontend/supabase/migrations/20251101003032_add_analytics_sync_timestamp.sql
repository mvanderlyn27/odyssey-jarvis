-- Add a timestamp to the tiktok_accounts table to track the last analytics sync.
-- This will be used by the cron job to determine if a new sync is due based on the user's plan.
ALTER TABLE public.tiktok_accounts
ADD COLUMN IF NOT EXISTS last_analytics_sync_at TIMESTAMPTZ;