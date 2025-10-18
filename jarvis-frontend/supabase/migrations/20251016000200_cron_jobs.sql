CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the 'publish-scheduled-posts' cron job to run every 5 minutes.
SELECT cron.schedule(
    'publish-scheduled-posts',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url:='https://tbgkbgpduudusaqumlkd.supabase.co/functions/v1/publish-scheduled-posts',
        headers:=(
            SELECT json_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || decrypted_secret
            )
            FROM vault.decrypted_secrets
            WHERE name = 'supabase_service_role_key'
        )
    )
    $$
);

-- Schedule the 'fetch-post-analytics' cron job to run at the start of every hour.
SELECT cron.schedule(
    'fetch-post-analytics',
    '0 * * * *',
    $$
    SELECT net.http_post(
        url:='https://tbgkbgpduudusaqumlkd.supabase.co/functions/v1/tiktok-bulk-video-details',
        headers:=(
            SELECT json_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || decrypted_secret
            )
            FROM vault.decrypted_secrets
            WHERE name = 'supabase_service_role_key'
        )
    )
    $$
);
