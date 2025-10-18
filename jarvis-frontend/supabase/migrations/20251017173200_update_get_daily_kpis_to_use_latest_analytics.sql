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
    WITH latest_daily_analytics AS (
        SELECT DISTINCT ON (p.id, DATE(pa.created_at))
            DATE(pa.created_at) as date,
            pa.views,
            pa.likes,
            pa.comments,
            pa.shares
        FROM
            post_analytics pa
        JOIN
            posts p ON pa.post_id = p.id
        WHERE
            p.tiktok_account_id = ANY(p_account_ids) AND
            pa.created_at >= p_start_date AND
            pa.created_at <= p_end_date
        ORDER BY
            p.id, DATE(pa.created_at), pa.created_at DESC
    )
    SELECT
        lda.date,
        SUM(lda.views)::bigint as total_views,
        SUM(lda.likes)::bigint as total_likes,
        SUM(lda.comments)::bigint as total_comments,
        SUM(lda.shares)::bigint as total_shares
    FROM
        latest_daily_analytics lda
    GROUP BY
        lda.date
    ORDER BY
        lda.date;
END;
$$ LANGUAGE plpgsql;
