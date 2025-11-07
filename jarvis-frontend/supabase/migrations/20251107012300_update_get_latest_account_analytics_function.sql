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
        taa.tiktok_account_id as account_id,
        taa.follower_count::bigint,
        taa.following_count::bigint,
        taa.likes_count::bigint,
        taa.video_count::bigint,
        taa.created_at
    FROM
        tiktok_account_analytics taa
    INNER JOIN (
        SELECT
            tiktok_account_id,
            max(created_at) as max_created_at
        FROM
            tiktok_account_analytics
        GROUP BY
            tiktok_account_id
    ) latest_analytics ON taa.tiktok_account_id = latest_analytics.tiktok_account_id AND taa.created_at = latest_analytics.max_created_at
    JOIN
        tiktok_accounts ta ON taa.tiktok_account_id = ta.id;
$$;
