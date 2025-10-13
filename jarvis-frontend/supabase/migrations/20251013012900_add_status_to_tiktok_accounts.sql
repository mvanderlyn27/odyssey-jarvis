CREATE TYPE tiktok_account_status AS ENUM ('active', 'expired');

ALTER TABLE public.tiktok_accounts
ADD COLUMN token_status tiktok_account_status DEFAULT 'active' NOT NULL;