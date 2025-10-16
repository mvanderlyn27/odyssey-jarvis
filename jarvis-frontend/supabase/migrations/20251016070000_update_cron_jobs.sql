-- Unscheduling the old cron jobs
SELECT cron.unschedule('publish-scheduled-posts');
SELECT cron.unschedule('fetch-post-analytics');

-- Schedule the 'publish-scheduled-posts' cron job to run every 10 minutes.
SELECT cron.schedule(
    'publish-scheduled-posts',
    '*/10 * * * *',
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

-- Schedule the 'fetch-post-analytics' cron job to run every 10 minutes.
SELECT cron.schedule(
    'fetch-post-analytics',
    '*/10 * * * *',
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
