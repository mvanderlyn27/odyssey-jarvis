DROP FUNCTION IF EXISTS get_latest_account_analytics();

CREATE OR REPLACE FUNCTION get_latest_account_analytics()
RETURNS TABLE (
    account_id uuid,
    follower_count bigint,
    following_count bigint,
    likes_count bigint,
    video_count bigint,
    total_post_views bigint,
    total_post_likes bigint,
    total_post_comments bigint,
    total_post_shares bigint,
    total_post_views_delta bigint,
    total_post_likes_delta bigint,
    total_post_comments_delta bigint,
    total_post_shares_delta bigint,
    follower_count_delta bigint,
    following_count_delta bigint,
    likes_count_delta bigint,
    video_count_delta bigint,
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
        taa.total_post_views::bigint,
        taa.total_post_likes::bigint,
        taa.total_post_comments::bigint,
        taa.total_post_shares::bigint,
        taa.total_post_views_delta::bigint,
        taa.total_post_likes_delta::bigint,
        taa.total_post_comments_delta::bigint,
        taa.total_post_shares_delta::bigint,
        taa.follower_count_delta::bigint,
        taa.following_count_delta::bigint,
        taa.likes_count_delta::bigint,
        taa.video_count_delta::bigint,
        taa.created_at
    FROM
        account_analytics taa
    INNER JOIN (
        SELECT
            tiktok_account_id,
            max(created_at) as max_created_at
        FROM
            account_analytics
        GROUP BY
            tiktok_account_id
    ) latest_analytics ON taa.tiktok_account_id = latest_analytics.tiktok_account_id AND taa.created_at = latest_analytics.max_created_at
    JOIN
        tiktok_accounts ta ON taa.tiktok_account_id = ta.id;
$$;
