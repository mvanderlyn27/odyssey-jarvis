-- Correct the column names in the aggregate_post_analytics function
CREATE OR REPLACE FUNCTION aggregate_post_analytics()
RETURNS void AS $$
BEGIN
    -- Hourly Aggregation
    INSERT INTO post_analytics_hourly (post_id, fetched_at, likes, comments, shares, views, user_id, organization_id)
    SELECT
        post_id,
        date_trunc('hour', fetched_at),
        AVG(likes)::INT,
        AVG(comments)::INT,
        AVG(shares)::INT,
        AVG(views)::INT,
        user_id,
        organization_id
    FROM post_analytics_raw
    WHERE fetched_at >= date_trunc('hour', NOW() - INTERVAL '1 hour')
    GROUP BY post_id, date_trunc('hour', fetched_at), user_id, organization_id
    ON CONFLICT (post_id, fetched_at) DO NOTHING;

    -- Daily Aggregation
    INSERT INTO post_analytics_daily (post_id, fetched_at, likes, comments, shares, views, user_id, organization_id)
    SELECT
        post_id,
        date_trunc('day', fetched_at),
        AVG(likes)::INT,
        AVG(comments)::INT,
        AVG(shares)::INT,
        AVG(views)::INT,
        user_id,
        organization_id
    FROM post_analytics_hourly
    WHERE fetched_at >= date_trunc('day', NOW() - INTERVAL '1 day')
    GROUP BY post_id, date_trunc('day', fetched_at), user_id, organization_id
    ON CONFLICT (post_id, fetched_at) DO NOTHING;

    -- Monthly Aggregation
    INSERT INTO post_analytics_monthly (post_id, fetched_at, likes, comments, shares, views, user_id, organization_id)
    SELECT
        post_id,
        date_trunc('month', fetched_at),
        AVG(likes)::INT,
        AVG(comments)::INT,
        AVG(shares)::INT,
        AVG(views)::INT,
        user_id,
        organization_id
    FROM post_analytics_daily
    WHERE fetched_at >= date_trunc('month', NOW() - INTERVAL '1 month')
    GROUP BY post_id, date_trunc('month', fetched_at), user_id, organization_id
    ON CONFLICT (post_id, fetched_at) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Correct the column names in the aggregate_account_analytics function
CREATE OR REPLACE FUNCTION aggregate_account_analytics()
RETURNS void AS $$
BEGIN
    -- Hourly Aggregation
    INSERT INTO account_analytics_hourly (account_id, fetched_at, follower_count, likes_count, video_count, user_id, organization_id)
    SELECT
        account_id,
        date_trunc('hour', fetched_at),
        AVG(follower_count)::INT,
        AVG(likes_count)::INT,
        AVG(video_count)::INT,
        user_id,
        organization_id
    FROM account_analytics_raw
    WHERE fetched_at >= date_trunc('hour', NOW() - INTERVAL '1 hour')
    GROUP BY account_id, date_trunc('hour', fetched_at), user_id, organization_id
    ON CONFLICT (account_id, fetched_at) DO NOTHING;

    -- Daily Aggregation
    INSERT INTO account_analytics_daily (account_id, fetched_at, follower_count, likes_count, video_count, user_id, organization_id)
    SELECT
        account_id,
        date_trunc('day', fetched_at),
        AVG(follower_count)::INT,
        AVG(likes_count)::INT,
        AVG(video_count)::INT,
        user_id,
        organization_id
    FROM account_analytics_hourly
    WHERE fetched_at >= date_trunc('day', NOW() - INTERVAL '1 day')
    GROUP BY account_id, date_trunc('day', fetched_at), user_id, organization_id
    ON CONFLICT (account_id, fetched_at) DO NOTHING;

    -- Monthly Aggregation
    INSERT INTO account_analytics_monthly (account_id, fetched_at, follower_count, likes_count, video_count, user_id, organization_id)
    SELECT
        account_id,
        date_trunc('month', fetched_at),
        AVG(follower_count)::INT,
        AVG(likes_count)::INT,
        AVG(video_count)::INT,
        user_id,
        organization_id
    FROM account_analytics_daily
    WHERE fetched_at >= date_trunc('month', NOW() - INTERVAL '1 month')
    GROUP BY account_id, date_trunc('month', fetched_at), user_id, organization_id
    ON CONFLICT (account_id, fetched_at) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
