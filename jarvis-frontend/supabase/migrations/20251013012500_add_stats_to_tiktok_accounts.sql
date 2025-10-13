ALTER TABLE public.tiktok_accounts
ADD COLUMN follower_count INTEGER,
ADD COLUMN likes_count INTEGER,
ADD COLUMN stats_updated_at TIMESTAMPTZ;