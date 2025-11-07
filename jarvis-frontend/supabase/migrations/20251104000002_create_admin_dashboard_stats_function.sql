CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  total_posts BIGINT,
  total_views BIGINT,
  scheduled_posts BIGINT,
  failed_posts BIGINT,
  published_posts BIGINT
) AS $$
BEGIN
  IF NOT is_jarvis_admin(auth.uid()) THEN
    RAISE EXCEPTION 'User is not a Jarvis admin';
  END IF;

  RETURN QUERY
  SELECT
    o.id AS organization_id,
    o.name AS organization_name,
    COUNT(p.id) AS total_posts,
    COALESCE(SUM(pa.views), 0) AS total_views,
    COUNT(p.id) FILTER (WHERE p.status = 'SCHEDULED') AS scheduled_posts,
    COUNT(p.id) FILTER (WHERE p.status = 'FAILED') AS failed_posts,
    COUNT(p.id) FILTER (WHERE p.status = 'PUBLISHED') AS published_posts
  FROM
    organizations o
    LEFT JOIN profiles pr ON o.id = pr.organization_id
    LEFT JOIN tiktok_accounts ta ON pr.id = ta.user_id
    LEFT JOIN posts p ON ta.id = p.tiktok_account_id
    LEFT JOIN (
      SELECT post_id, SUM(views) as views
      FROM post_analytics
      GROUP BY post_id
    ) pa ON p.id = pa.post_id
  GROUP BY
    o.id, o.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
