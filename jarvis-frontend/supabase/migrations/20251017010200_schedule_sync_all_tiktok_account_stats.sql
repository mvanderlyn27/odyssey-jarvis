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
            'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_service_role_key')
          )
      ) as request_id;
    $$
  );
