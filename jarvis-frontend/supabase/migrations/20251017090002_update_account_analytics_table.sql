ALTER TABLE "public"."account_analytics"
ADD COLUMN IF NOT EXISTS "total_post_views" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "total_post_likes" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "total_post_comments" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "total_post_shares" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "total_post_views_delta" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "total_post_likes_delta" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "total_post_comments_delta" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "total_post_shares_delta" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "follower_count_delta" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "following_count_delta" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "likes_count_delta" integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "video_count_delta" integer NOT NULL DEFAULT 0;