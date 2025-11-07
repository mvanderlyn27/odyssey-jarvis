-- 1. Redefine get_latest_account_analytics to use a LEFT JOIN.
-- This ensures all accounts are returned, even with no analytics data.
DROP FUNCTION IF EXISTS get_latest_account_analytics();
CREATE OR REPLACE FUNCTION get_latest_account_analytics()
RETURNS TABLE (
    account_id uuid,
    follower_count bigint,
    following_count bigint,
    likes_count bigint,
    video_count bigint,
    created_at timestamp with time zone
)
LANGUAGE sql
AS $$
    SELECT
        ta.id as account_id,
        latest_analytics.follower_count,
        latest_analytics.following_count,
        latest_analytics.likes_count,
        latest_analytics.video_count,
        latest_analytics.created_at
    FROM
        tiktok_accounts ta
    LEFT JOIN (
        SELECT
            taa.tiktok_account_id,
            taa.follower_count::bigint,
            taa.following_count::bigint,
            taa.likes_count::bigint,
            taa.video_count::bigint,
            taa.created_at
        FROM
            account_analytics_raw taa
        INNER JOIN (
            SELECT
                tiktok_account_id,
                max(created_at) as max_created_at
            FROM
                account_analytics_raw
            GROUP BY
                tiktok_account_id
        ) latest ON taa.tiktok_account_id = latest.tiktok_account_id AND taa.created_at = latest.max_created_at
    ) latest_analytics ON ta.id = latest_analytics.tiktok_account_id;
$$;

-- 2. Redefine get_account_analytics_history to handle NULLs gracefully.
-- This prevents type mismatch errors when no data is available.
DROP FUNCTION IF EXISTS get_account_analytics_history(UUID, TEXT, TIMESTAMPTZ, TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION get_account_analytics_history(
    p_account_id UUID,
    p_granularity TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
)
RETURNS TABLE(time_bucket TIMESTAMPTZ, total_followers BIGINT, total_likes BIGINT, total_comments BIGINT, total_shares BIGINT, total_views BIGINT) AS $$
DECLARE
    v_plan_granularity TEXT;
    v_user_id UUID;
    v_source_table TEXT;
BEGIN
    SELECT user_id INTO v_user_id FROM tiktok_accounts WHERE id = p_account_id;

    SELECT features->>'analytics_granularity'
    INTO v_plan_granularity
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.user_id = v_user_id AND s.status = 'active'
    LIMIT 1;

    v_source_table := CASE v_plan_granularity
        WHEN 'raw' THEN 'account_analytics_raw'
        WHEN 'hourly' THEN 'account_analytics_hourly'
        ELSE 'account_analytics_daily'
    END;

    RETURN QUERY EXECUTE format(
        'SELECT
            date_trunc(%L, created_at) as time_bucket,
            COALESCE(MAX(follower_count), 0)::BIGINT as total_followers,
            COALESCE(MAX(likes_count), 0)::BIGINT as total_likes,
            COALESCE(MAX(total_post_comments), 0)::BIGINT as total_comments,
            COALESCE(MAX(total_post_shares), 0)::BIGINT as total_shares,
            COALESCE(MAX(total_post_views), 0)::BIGINT as total_views
        FROM %I
        WHERE tiktok_account_id = %L
          AND created_at >= %L
          AND created_at <= %L
        GROUP BY time_bucket
        ORDER BY time_bucket ASC;',
        p_granularity,
        v_source_table,
        p_account_id,
        start_date,
        end_date
    );
END;
$$ LANGUAGE plpgsql;
