ALTER TABLE public.tiktok_accounts
ADD COLUMN IF NOT EXISTS last_video_import_at TIMESTAMPTZ;