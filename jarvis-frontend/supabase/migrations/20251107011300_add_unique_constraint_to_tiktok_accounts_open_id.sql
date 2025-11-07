-- Add a unique constraint on the open_id column to support the upsert operation
ALTER TABLE public.tiktok_accounts ADD CONSTRAINT tiktok_accounts_open_id_key UNIQUE (open_id);