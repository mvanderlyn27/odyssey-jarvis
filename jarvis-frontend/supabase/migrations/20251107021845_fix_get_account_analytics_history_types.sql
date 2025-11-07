CREATE OR REPLACE FUNCTION get_account_analytics_history(
    p_account_id UUID,
    p_granularity TEXT, -- 'hourly', 'daily', 'weekly', 'monthly'
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ
)
RETURNS TABLE(time_bucket TIMESTAMPTZ, total_followers BIGINT, total_likes BIGINT, total_comments BIGINT, total_shares BIGINT, total_views BIGINT) AS $$
DECLARE
    v_plan_granularity TEXT;
    v_user_id UUID;
    v_source_table TEXT;
BEGIN
    -- 1. Get the user_id for the given account
    SELECT user_id INTO v_user_id FROM tiktok_accounts WHERE id = p_account_id;

    -- 2. Get the user's maximum allowed analytics granularity from their plan
    SELECT features->>'analytics_granularity'
    INTO v_plan_granularity
    FROM subscriptions s
    JOIN plans p ON s.plan_id = p.id
    WHERE s.user_id = v_user_id AND s.status = 'active'
    LIMIT 1;

    -- 3. Determine the best source table based on the user's plan
    v_source_table := CASE v_plan_granularity
        WHEN 'raw' THEN 'account_analytics_raw'
        WHEN 'hourly' THEN 'account_analytics_hourly'
        ELSE 'account_analytics_daily'
    END;

    -- 4. Build and execute the dynamic query for aggregation
    RETURN QUERY EXECUTE format(
        'SELECT
            date_trunc(%L, created_at) as time_bucket,
            MAX(follower_count)::BIGINT as total_followers,
            MAX(likes_count)::BIGINT as total_likes,
            MAX(total_post_comments)::BIGINT as total_comments,
            MAX(total_post_shares)::BIGINT as total_shares,
            MAX(total_post_views)::BIGINT as total_views
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
