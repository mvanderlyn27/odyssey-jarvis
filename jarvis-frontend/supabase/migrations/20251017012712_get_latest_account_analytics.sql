create or replace function get_latest_account_analytics()
returns table (
    account_id uuid,
    follower_count bigint,
    following_count bigint,
    likes_count bigint,
    video_count bigint,
    created_at timestamp with time zone
)
language sql
as $$
    select
        taa.tiktok_account_id as account_id,
        taa.follower_count::bigint,
        taa.following_count::bigint,
        taa.likes_count::bigint,
        taa.video_count::bigint,
        taa.created_at
    from
        account_analytics taa
    inner join (
        select
            tiktok_account_id,
            max(created_at) as max_created_at
        from
            account_analytics
        group by
            tiktok_account_id
    ) latest_analytics on taa.tiktok_account_id = latest_analytics.tiktok_account_id and taa.created_at = latest_analytics.max_created_at
    join
        tiktok_accounts ta on taa.tiktok_account_id = ta.id;

$$;
