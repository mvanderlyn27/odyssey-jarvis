-- Drop the old helper function if it exists
DROP FUNCTION IF EXISTS get_post_user_id(UUID);

-- Create a new helper function to check if the current user can manage a post
-- (either as the direct owner or as a member of the organization that owns the post)
CREATE OR REPLACE FUNCTION can_manage_post(post_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    post_rec RECORD;
BEGIN
    -- Get the user_id and organization_id for the given post
    SELECT user_id, organization_id INTO post_rec FROM public.posts WHERE id = post_id_param;

    -- If the post is owned by a user, check if the current user is the owner
    IF post_rec.user_id IS NOT NULL THEN
        RETURN auth.uid() = post_rec.user_id;
    -- If the post is owned by an organization, check if the current user is a member of that organization
    ELSIF post_rec.organization_id IS NOT NULL THEN
        RETURN EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid() AND organization_id = post_rec.organization_id
        );
    ELSE
        -- If the post has no owner, deny access
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old, insecure policies
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow post owners to upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow post owners to view their assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow post owners to delete their assets" ON storage.objects;

-- Create new, secure policies for managing post assets
-- The post ID is extracted from the file path, which is assumed to be in the format: {asset_type}/{post_id}/{asset_id}
CREATE POLICY "Allow post members to upload assets" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'tiktok_assets' AND
    can_manage_post((split_part(name, '/', 2))::UUID)
);

CREATE POLICY "Allow post members to view their assets" ON storage.objects
FOR SELECT TO authenticated USING (
    bucket_id = 'tiktok_assets' AND
    can_manage_post((split_part(name, '/', 2))::UUID)
);

CREATE POLICY "Allow post members to delete their assets" ON storage.objects
FOR DELETE TO authenticated USING (
    bucket_id = 'tiktok_assets' AND
    can_manage_post((split_part(name, '/', 2))::UUID)
);
