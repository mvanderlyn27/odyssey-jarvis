-- Create the trigger function
CREATE OR REPLACE FUNCTION handle_new_asset()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Invoke the 'process-post-asset' edge function
  -- The function expects a payload with a 'record' key containing the new object's data
  PERFORM net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_url') || '/functions/v1/process-post-asset',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'supabase_service_role_key')
    ),
    body := jsonb_build_object('record', NEW)
  );
  RETURN NEW;
END;
$$;

-- Create the trigger on the storage.objects table
CREATE TRIGGER on_new_asset_created
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'tiktok_assets')
EXECUTE FUNCTION handle_new_asset();
