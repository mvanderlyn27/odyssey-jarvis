-- Add SCHEDULED to post_status enum
ALTER TYPE "public"."post_status" ADD VALUE IF NOT EXISTS 'SCHEDULED';

-- Add new columns to posts table
ALTER TABLE "public"."posts"
ADD COLUMN IF NOT EXISTS "post_id" text,
ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp with time zone,
ADD COLUMN IF NOT EXISTS "created_in_jarvis" boolean DEFAULT true;

-- Add a unique constraint to post_id to ensure no duplicate external posts are tracked.
-- This is added separately to avoid issues if the column already exists.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'posts_post_id_key' AND conrelid = 'public.posts'::regclass
    ) THEN
        ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_post_id_key" UNIQUE ("post_id");
    END IF;
END$$;

-- Create post_analytics table
CREATE TABLE IF NOT EXISTS "public"."post_analytics" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "post_id" uuid,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "views" integer,
    "likes" integer,
    "comments" integer,
    "shares" integer,
    PRIMARY KEY ("id"),
    CONSTRAINT "post_analytics_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE
);

-- Add RLS to post_analytics
ALTER TABLE "public"."post_analytics" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access for authenticated users" ON "public"."post_analytics";
CREATE POLICY "Allow full access for authenticated users" ON "public"."post_analytics" FOR ALL TO authenticated USING (true) WITH CHECK (true);
