-- Unscheduling the old cron jobs to be safe, as we are changing the schedule and command.
SELECT cron.unschedule('publish-scheduled-posts');
SELECT cron.unschedule('fetch-post-analytics');

-- Schedule the 'publish-scheduled-posts' cron job to run every 10 minutes.
SELECT cron.schedule(
    'publish-scheduled-posts',
    '*/10 * * * *',
    $$
    select
      net.http_post(
          url:= (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_url') || '/functions/v1/publish-scheduled-posts',
          headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_service_role_key')
          ),
      ) as request_id;
    $$
);

-- Schedule the 'fetch-post-analytics' cron job to run every 10 minutes.
SELECT cron.schedule(
    'fetch-post-analytics',
    '*/10 * * * *',
    $$
    select
      net.http_post(
          url:= (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_url') || '/functions/v1/tiktok-bulk-video-details',
          headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_service_role_key')
          ),
          body:='{}'::jsonb
      ) as request_id;
    $$
);
