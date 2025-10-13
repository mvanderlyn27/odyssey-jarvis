-- Create a private bucket for tiktok assets, if it doesn't exist
INSERT INTO
    storage.buckets (id, name, public)
VALUES
    ('tiktok_assets', 'tiktok_assets', false) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies before creating new ones to ensure idempotency
DROP POLICY IF EXISTS "Allow authenticated users to view assets" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to upload assets" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to update assets" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated users to delete assets" ON storage.objects;

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