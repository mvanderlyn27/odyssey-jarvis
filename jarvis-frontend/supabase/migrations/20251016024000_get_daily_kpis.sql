CREATE OR REPLACE FUNCTION get_daily_kpis(
    p_account_ids uuid[],
    p_start_date date,
    p_end_date date
)
RETURNS TABLE(
    date date,
    total_views bigint,
    total_likes bigint,
    total_comments bigint,
    total_shares bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE(pa.created_at) as date,
        SUM(pa.views) as total_views,
        SUM(pa.likes) as total_likes,
        SUM(pa.comments) as total_comments,
        SUM(pa.shares) as total_shares
    FROM
        post_analytics pa
    JOIN
        posts p ON pa.post_id = p.id
    WHERE
        p.tiktok_account_id = ANY(p_account_ids) AND
        pa.created_at >= p_start_date AND
        pa.created_at <= p_end_date
    GROUP BY
        DATE(pa.created_at)
    ORDER BY
        date;
END;
$$ LANGUAGE plpgsql;
