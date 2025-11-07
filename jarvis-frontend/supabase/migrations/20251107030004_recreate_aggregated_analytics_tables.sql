-- This migration completely rebuilds the aggregated analytics tables to resolve cron job failures.
-- The previous approach using `LIKE` copied `NOT NULL` constraints for columns that were not being aggregated,
-- causing `null value` errors. This migration defines the schemas explicitly with only the necessary columns.

-- Step 1: Drop the old aggregation functions and tables.
DROP FUNCTION IF EXISTS aggregate_post_analytics();
DROP FUNCTION IF EXISTS aggregate_account_analytics();

DROP TABLE IF EXISTS public.post_analytics_hourly;
DROP TABLE IF EXISTS public.post_analytics_daily;
DROP TABLE IF EXISTS public.post_analytics_monthly;

DROP TABLE IF EXISTS public.account_analytics_hourly;
DROP TABLE IF EXISTS public.account_analytics_daily;
DROP TABLE IF EXISTS public.account_analytics_monthly;

-- Step 2: Re-create the aggregated tables with a minimal, explicit schema.

-- Post Analytics Tables
CREATE TABLE public.post_analytics_hourly (
    post_id uuid NOT NULL,
    fetched_at timestamptz NOT NULL,
    views integer,
    likes integer,
    comments integer,
    shares integer,
    user_id uuid,
    organization_id uuid,
    PRIMARY KEY (post_id, fetched_at)
);

CREATE TABLE public.post_analytics_daily (
    post_id uuid NOT NULL,
    fetched_at timestamptz NOT NULL,
    views integer,
    likes integer,
    comments integer,
    shares integer,
    user_id uuid,
    organization_id uuid,
    PRIMARY KEY (post_id, fetched_at)
);

CREATE TABLE public.post_analytics_monthly (
    post_id uuid NOT NULL,
    fetched_at timestamptz NOT NULL,
    views integer,
    likes integer,
    comments integer,
    shares integer,
    user_id uuid,
    organization_id uuid,
    PRIMARY KEY (post_id, fetched_at)
);

-- Account Analytics Tables
CREATE TABLE public.account_analytics_hourly (
    tiktok_account_id uuid NOT NULL,
    fetched_at timestamptz NOT NULL,
    follower_count integer,
    following_count integer,
    likes_count integer,
    video_count integer,
    total_post_views integer,
    total_post_likes integer,
    total_post_comments integer,
    total_post_shares integer,
    user_id uuid,
    organization_id uuid,
    PRIMARY KEY (tiktok_account_id, fetched_at)
);

CREATE TABLE public.account_analytics_daily (
    tiktok_account_id uuid NOT NULL,
    fetched_at timestamptz NOT NULL,
    follower_count integer,
    following_count integer,
    likes_count integer,
    video_count integer,
    total_post_views integer,
    total_post_likes integer,
    total_post_comments integer,
    total_post_shares integer,
    user_id uuid,
    organization_id uuid,
    PRIMARY KEY (tiktok_account_id, fetched_at)
);

CREATE TABLE public.account_analytics_monthly (
    tiktok_account_id uuid NOT NULL,
    fetched_at timestamptz NOT NULL,
    follower_count integer,
    following_count integer,
    likes_count integer,
    video_count integer,
    total_post_views integer,
    total_post_likes integer,
    total_post_comments integer,
    total_post_shares integer,
    user_id uuid,
    organization_id uuid,
    PRIMARY KEY (tiktok_account_id, fetched_at)
);

-- Step 3: Re-apply RLS policies to the new tables.
ALTER TABLE public.post_analytics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_analytics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_analytics_monthly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own post analytics" ON public.post_analytics_hourly FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
CREATE POLICY "Users can view their own post analytics" ON public.post_analytics_daily FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
CREATE POLICY "Users can view their own post analytics" ON public.post_analytics_monthly FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());

CREATE POLICY "Users can view their own account analytics" ON public.account_analytics_hourly FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
CREATE POLICY "Users can view their own account analytics" ON public.account_analytics_daily FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
CREATE POLICY "Users can view their own account analytics" ON public.account_analytics_monthly FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());


-- Step 4: Re-create the aggregation functions to match the new schemas.

CREATE OR REPLACE FUNCTION aggregate_post_analytics()
RETURNS void AS $$
BEGIN
    -- Hourly
    INSERT INTO post_analytics_hourly (post_id, fetched_at, views, likes, comments, shares, user_id, organization_id)
    SELECT post_id, date_trunc('hour', fetched_at), AVG(views)::INT, AVG(likes)::INT, AVG(comments)::INT, AVG(shares)::INT, user_id, organization_id
    FROM post_analytics_raw
    WHERE fetched_at >= date_trunc('hour', NOW() - INTERVAL '1 hour')
    GROUP BY post_id, date_trunc('hour', fetched_at), user_id, organization_id
    ON CONFLICT (post_id, fetched_at) DO NOTHING;

    -- Daily
    INSERT INTO post_analytics_daily (post_id, fetched_at, views, likes, comments, shares, user_id, organization_id)
    SELECT post_id, date_trunc('day', fetched_at), AVG(views)::INT, AVG(likes)::INT, AVG(comments)::INT, AVG(shares)::INT, user_id, organization_id
    FROM post_analytics_hourly
    WHERE fetched_at >= date_trunc('day', NOW() - INTERVAL '1 day')
    GROUP BY post_id, date_trunc('day', fetched_at), user_id, organization_id
    ON CONFLICT (post_id, fetched_at) DO NOTHING;

    -- Monthly
    INSERT INTO post_analytics_monthly (post_id, fetched_at, views, likes, comments, shares, user_id, organization_id)
    SELECT post_id, date_trunc('month', fetched_at), AVG(views)::INT, AVG(likes)::INT, AVG(comments)::INT, AVG(shares)::INT, user_id, organization_id
    FROM post_analytics_daily
    WHERE fetched_at >= date_trunc('month', NOW() - INTERVAL '1 month')
    GROUP BY post_id, date_trunc('month', fetched_at), user_id, organization_id
    ON CONFLICT (post_id, fetched_at) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION aggregate_account_analytics()
RETURNS void AS $$
BEGIN
    -- Hourly
    INSERT INTO account_analytics_hourly (tiktok_account_id, fetched_at, follower_count, following_count, likes_count, video_count, total_post_views, total_post_likes, total_post_comments, total_post_shares, user_id, organization_id)
    SELECT tiktok_account_id, date_trunc('hour', fetched_at), AVG(follower_count)::INT, AVG(following_count)::INT, AVG(likes_count)::INT, AVG(video_count)::INT, AVG(total_post_views)::INT, AVG(total_post_likes)::INT, AVG(total_post_comments)::INT, AVG(total_post_shares)::INT, user_id, organization_id
    FROM account_analytics_raw
    WHERE fetched_at >= date_trunc('hour', NOW() - INTERVAL '1 hour')
    GROUP BY tiktok_account_id, date_trunc('hour', fetched_at), user_id, organization_id
    ON CONFLICT (tiktok_account_id, fetched_at) DO NOTHING;

    -- Daily
    INSERT INTO account_analytics_daily (tiktok_account_id, fetched_at, follower_count, following_count, likes_count, video_count, total_post_views, total_post_likes, total_post_comments, total_post_shares, user_id, organization_id)
    SELECT tiktok_account_id, date_trunc('day', fetched_at), AVG(follower_count)::INT, AVG(following_count)::INT, AVG(likes_count)::INT, AVG(video_count)::INT, AVG(total_post_views)::INT, AVG(total_post_likes)::INT, AVG(total_post_comments)::INT, AVG(total_post_shares)::INT, user_id, organization_id
    FROM account_analytics_hourly
    WHERE fetched_at >= date_trunc('day', NOW() - INTERVAL '1 day')
    GROUP BY tiktok_account_id, date_trunc('day', fetched_at), user_id, organization_id
    ON CONFLICT (tiktok_account_id, fetched_at) DO NOTHING;

    -- Monthly
    INSERT INTO account_analytics_monthly (tiktok_account_id, fetched_at, follower_count, following_count, likes_count, video_count, total_post_views, total_post_likes, total_post_comments, total_post_shares, user_id, organization_id)
    SELECT tiktok_account_id, date_trunc('month', fetched_at), AVG(follower_count)::INT, AVG(following_count)::INT, AVG(likes_count)::INT, AVG(video_count)::INT, AVG(total_post_views)::INT, AVG(total_post_likes)::INT, AVG(total_post_comments)::INT, AVG(total_post_shares)::INT, user_id, organization_id
    FROM account_analytics_daily
    WHERE fetched_at >= date_trunc('month', NOW() - INTERVAL '1 month')
    GROUP BY tiktok_account_id, date_trunc('month', fetched_at), user_id, organization_id
    ON CONFLICT (tiktok_account_id, fetched_at) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
