-- Phase 1: Tiered Analytics Backend
-- Objective: Re-architect the analytics system to support different data granularity levels based on subscription plans and ensure long-term scalability.

-- Step 1: Establish Multi-Tenant Analytics Schema

-- Rename Raw Tables
ALTER TABLE post_analytics RENAME TO post_analytics_raw;
ALTER TABLE account_analytics RENAME TO account_analytics_raw;

-- Create Aggregated Tables for Post Analytics
CREATE TABLE post_analytics_hourly (
    LIKE post_analytics_raw INCLUDING ALL,
    PRIMARY KEY (post_id, fetched_at)
);
CREATE TABLE post_analytics_daily (
    LIKE post_analytics_raw INCLUDING ALL,
    PRIMARY KEY (post_id, fetched_at)
);
CREATE TABLE post_analytics_monthly (
    LIKE post_analytics_raw INCLUDING ALL,
    PRIMARY KEY (post_id, fetched_at)
);

-- Create Aggregated Tables for Account Analytics
CREATE TABLE account_analytics_hourly (
    LIKE account_analytics_raw INCLUDING ALL,
    PRIMARY KEY (account_id, fetched_at)
);
CREATE TABLE account_analytics_daily (
    LIKE account_analytics_raw INCLUDING ALL,
    PRIMARY KEY (account_id, fetched_at)
);
CREATE TABLE account_analytics_monthly (
    LIKE account_analytics_raw INCLUDING ALL,
    PRIMARY KEY (account_id, fetched_at)
);

-- Add Multi-Tenancy Columns
ALTER TABLE post_analytics_raw ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE post_analytics_raw ADD COLUMN organization_id UUID; -- Add FK constraint later when organizations table is created
ALTER TABLE post_analytics_hourly ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE post_analytics_hourly ADD COLUMN organization_id UUID;
ALTER TABLE post_analytics_daily ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE post_analytics_daily ADD COLUMN organization_id UUID;
ALTER TABLE post_analytics_monthly ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE post_analytics_monthly ADD COLUMN organization_id UUID;

ALTER TABLE account_analytics_raw ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE account_analytics_raw ADD COLUMN organization_id UUID;
ALTER TABLE account_analytics_hourly ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE account_analytics_hourly ADD COLUMN organization_id UUID;
ALTER TABLE account_analytics_daily ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE account_analytics_daily ADD COLUMN organization_id UUID;
ALTER TABLE account_analytics_monthly ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE account_analytics_monthly ADD COLUMN organization_id UUID;


-- Step 2: Implement Tier-Based Aggregation & Retention Logic

-- Aggregation Functions
CREATE OR REPLACE FUNCTION aggregate_post_analytics()
RETURNS void AS $$
BEGIN
    -- Hourly Aggregation
    INSERT INTO post_analytics_hourly
    SELECT
        post_id,
        date_trunc('hour', fetched_at),
        AVG(likes_count)::INT,
        AVG(comments_count)::INT,
        AVG(shares_count)::INT,
        AVG(views_count)::INT,
        user_id,
        organization_id
    FROM post_analytics_raw
    WHERE fetched_at >= date_trunc('hour', NOW() - INTERVAL '1 hour')
    GROUP BY post_id, date_trunc('hour', fetched_at), user_id, organization_id
    ON CONFLICT (post_id, fetched_at) DO NOTHING;

    -- Daily Aggregation
    INSERT INTO post_analytics_daily
    SELECT
        post_id,
        date_trunc('day', fetched_at),
        AVG(likes_count)::INT,
        AVG(comments_count)::INT,
        AVG(shares_count)::INT,
        AVG(views_count)::INT,
        user_id,
        organization_id
    FROM post_analytics_hourly
    WHERE fetched_at >= date_trunc('day', NOW() - INTERVAL '1 day')
    GROUP BY post_id, date_trunc('day', fetched_at), user_id, organization_id
    ON CONFLICT (post_id, fetched_at) DO NOTHING;

    -- Monthly Aggregation
    INSERT INTO post_analytics_monthly
    SELECT
        post_id,
        date_trunc('month', fetched_at),
        AVG(likes_count)::INT,
        AVG(comments_count)::INT,
        AVG(shares_count)::INT,
        AVG(views_count)::INT,
        user_id,
        organization_id
    FROM post_analytics_daily
    WHERE fetched_at >= date_trunc('month', NOW() - INTERVAL '1 month')
    GROUP BY post_id, date_trunc('month', fetched_at), user_id, organization_id
    ON CONFLICT (post_id, fetched_at) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION aggregate_account_analytics()
RETURNS void AS $$
BEGIN
    -- Hourly Aggregation
    INSERT INTO account_analytics_hourly
    SELECT
        account_id,
        date_trunc('hour', fetched_at),
        AVG(follower_count)::INT,
        AVG(likes_count)::INT,
        AVG(videos_count)::INT,
        user_id,
        organization_id
    FROM account_analytics_raw
    WHERE fetched_at >= date_trunc('hour', NOW() - INTERVAL '1 hour')
    GROUP BY account_id, date_trunc('hour', fetched_at), user_id, organization_id
    ON CONFLICT (account_id, fetched_at) DO NOTHING;

    -- Daily Aggregation
    INSERT INTO account_analytics_daily
    SELECT
        account_id,
        date_trunc('day', fetched_at),
        AVG(follower_count)::INT,
        AVG(likes_count)::INT,
        AVG(videos_count)::INT,
        user_id,
        organization_id
    FROM account_analytics_hourly
    WHERE fetched_at >= date_trunc('day', NOW() - INTERVAL '1 day')
    GROUP BY account_id, date_trunc('day', fetched_at), user_id, organization_id
    ON CONFLICT (account_id, fetched_at) DO NOTHING;

    -- Monthly Aggregation
    INSERT INTO account_analytics_monthly
    SELECT
        account_id,
        date_trunc('month', fetched_at),
        AVG(follower_count)::INT,
        AVG(likes_count)::INT,
        AVG(videos_count)::INT,
        user_id,
        organization_id
    FROM account_analytics_daily
    WHERE fetched_at >= date_trunc('month', NOW() - INTERVAL '1 month')
    GROUP BY account_id, date_trunc('month', fetched_at), user_id, organization_id
    ON CONFLICT (account_id, fetched_at) DO NOTHING;
END;
$$ LANGUAGE plpgsql;


-- Data Retention Functions
CREATE OR REPLACE FUNCTION purge_old_analytics_data()
RETURNS void AS $$
BEGIN
    -- Purge raw data older than 2 days (configurable based on lowest tier)
    DELETE FROM post_analytics_raw WHERE fetched_at < NOW() - INTERVAL '2 days';
    DELETE FROM account_analytics_raw WHERE fetched_at < NOW() - INTERVAL '2 days';

    -- Purge hourly data older than 30 days
    DELETE FROM post_analytics_hourly WHERE fetched_at < NOW() - INTERVAL '30 days';
    DELETE FROM account_analytics_hourly WHERE fetched_at < NOW() - INTERVAL '30 days';

    -- Purge daily data older than 1 year
    DELETE FROM post_analytics_daily WHERE fetched_at < NOW() - INTERVAL '1 year';
    DELETE FROM account_analytics_daily WHERE fetched_at < NOW() - INTERVAL '1 year';

    -- Monthly data is kept indefinitely
END;
$$ LANGUAGE plpgsql;


-- Schedule Cron Jobs
SELECT cron.schedule('analytics-aggregation', '0 * * * *', 'SELECT aggregate_post_analytics(); SELECT aggregate_account_analytics();');
SELECT cron.schedule('analytics-purging', '0 0 * * *', 'SELECT purge_old_analytics_data();');
