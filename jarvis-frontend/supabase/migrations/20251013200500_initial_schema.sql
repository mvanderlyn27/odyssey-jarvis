-- Create tiktok_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."tiktok_accounts" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "access_token" text NOT NULL,
    "refresh_token" text,
    "scope" text,
    "open_id" text,
    "display_name" text,
    "profile_image_url" text,
    "status" text DEFAULT 'active'::text,
    PRIMARY KEY ("id")
);

-- Add RLS to tiktok_accounts
ALTER TABLE "public"."tiktok_accounts" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON "public"."tiktok_accounts";
CREATE POLICY "Allow full access for authenticated users" ON "public"."tiktok_accounts" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create post_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_status') THEN
        CREATE TYPE "public"."post_status" AS ENUM (
            'DRAFT',
            'PROCESSING',
            'PUBLISHED',
            'FAILED',
            'INBOX'
        );
    END IF;
END$$;

-- Create posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."posts" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "title" text,
    "description" text,
    "tiktok_account_id" uuid,
    "tiktok_publish_id" text,
    "post_url" text,
    "reason" text,
    "status" "public"."post_status" DEFAULT 'DRAFT',
    PRIMARY KEY ("id"),
    CONSTRAINT "posts_tiktok_account_id_fkey" FOREIGN KEY ("tiktok_account_id") REFERENCES "public"."tiktok_accounts"("id") ON DELETE SET NULL
);

-- Add RLS to posts
ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON "public"."posts";
CREATE POLICY "Allow full access for authenticated users" ON "public"."posts" FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create asset_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asset_type') THEN
        CREATE TYPE "public"."asset_type" AS ENUM ('videos', 'slides');
    END IF;
END$$;


-- Create post_assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."post_assets" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "post_id" uuid,
    "asset_url" text,
    "asset_type" "public"."asset_type",
    "sort_order" integer,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    CONSTRAINT "post_assets_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE
);

-- Add RLS to post_assets
ALTER TABLE "public"."post_assets" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON "public"."post_assets";
CREATE POLICY "Allow full access for authenticated users" ON "public"."post_assets" FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- Create storage bucket for tiktok_assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('tiktok_assets', 'tiktok_assets', false)
ON CONFLICT (id) DO NOTHING;

-- Add RLS to storage for tiktok_assets bucket
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON storage.objects;
CREATE POLICY "Allow full access to authenticated users" ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'tiktok_assets')
WITH CHECK (bucket_id = 'tiktok_assets');
