-- Create a new storage bucket for account avatars
INSERT INTO
    storage.buckets (id, name, public)
VALUES
    ('account_avatars', 'account_avatars', true) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the new bucket
-- Allow public read access
CREATE POLICY "Allow public read access" ON storage.objects FOR
SELECT
    USING (bucket_id = 'account_avatars');

-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload" ON storage.objects FOR INSERT
WITH
    CHECK (
        bucket_id = 'account_avatars'
        AND auth.role () = 'authenticated'
    );