DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='total_post_views') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "total_post_views" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='total_post_likes') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "total_post_likes" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='total_post_comments') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "total_post_comments" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='total_post_shares') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "total_post_shares" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='total_post_views_delta') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "total_post_views_delta" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='total_post_likes_delta') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "total_post_likes_delta" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='total_post_comments_delta') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "total_post_comments_delta" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='total_post_shares_delta') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "total_post_shares_delta" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='follower_count_delta') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "follower_count_delta" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='following_count_delta') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "following_count_delta" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='likes_count_delta') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "likes_count_delta" integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='account_analytics' AND column_name='video_count_delta') THEN
        ALTER TABLE "public"."account_analytics" ADD COLUMN "video_count_delta" integer NOT NULL DEFAULT 0;
    END IF;
END$$;
