-- Add RLS policies to the tiktok_assets storage bucket
CREATE POLICY "Allow authenticated users to view assets" ON storage.objects FOR
SELECT
    USING (
        bucket_id = 'tiktok_assets'
        AND auth.role () = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to upload assets" ON storage.objects FOR INSERT
WITH
    CHECK (
        bucket_id = 'tiktok_assets'
        AND auth.role () = 'authenticated'
    );

CREATE POLICY "Allow authenticated users to update assets" ON storage.objects FOR
UPDATE USING (
    bucket_id = 'tiktok_assets'
    AND auth.role () = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete assets" ON storage.objects FOR DELETE USING (
    bucket_id = 'tiktok_assets'
    AND auth.role () = 'authenticated'
);