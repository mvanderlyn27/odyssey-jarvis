-- Unschedule all existing cron jobs to prepare for rescheduling with new auth.
select cron.unschedule('publish-scheduled-posts');
select cron.unschedule('fetch-post-analytics');
select cron.unschedule('sync-all-tiktok-account-stats');

-- Reschedule 'publish-scheduled-posts' to run every 10 minutes with the internal secret.
select
  cron.schedule (
    'publish-scheduled-posts',
    '*/10 * * * *',
    $$
    select
      net.http_post(
          url:= (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_url') || '/functions/v1/publish-scheduled-posts',
          headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'X-Internal-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'internal_secret_key')
          )
      ) as request_id;
    $$
  );

-- Reschedule 'fetch-post-analytics' to run every 10 minutes with the internal secret.
select
  cron.schedule (
    'fetch-post-analytics',
    '*/10 * * * *',
    $$
    select
      net.http_post(
          url:= (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_url') || '/functions/v1/tiktok-bulk-video-details',
          headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'X-Internal-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'internal_secret_key')
          ),
          body:='{}'::jsonb
      ) as request_id;
    $$
  );

-- Reschedule 'sync-all-tiktok-account-stats' to run every hour with the internal secret.
select
  cron.schedule (
    'sync-all-tiktok-account-stats',
    '0 * * * *',
    $$
    select
      net.http_post(
          url:= (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_url') || '/functions/v1/sync-all-tiktok-account-stats',
          headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'X-Internal-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'internal_secret_key')
          )
      ) as request_id;
    $$
  );
