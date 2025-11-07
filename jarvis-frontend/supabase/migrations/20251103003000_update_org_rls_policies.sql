-- Drop the old, more restrictive policies first.
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- ORGANIZATIONS TABLE RLS
-- 1. Allow all members of an organization to view it.
CREATE POLICY "Members can view their own organization" ON public.organizations FOR
SELECT
    USING (id = get_my_organization_id ());

-- 2. Allow organization owners to update their organization's details.
CREATE POLICY "Owners can update their own organization" ON public.organizations FOR
UPDATE
WITH
    CHECK (
        id = get_my_organization_id ()
        AND (
            SELECT
                role
            FROM
                public.profiles
            WHERE
                id = auth.uid ()
                AND organization_id = id
        ) = 'owner'
    );

-- PROFILES TABLE RLS
-- 1. Allow users to view and update their own profile.
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (id = auth.uid ());

-- 2. Allow members to view the profiles of others in the same organization.
CREATE POLICY "Members can view profiles in their organization" ON public.profiles FOR
SELECT
    USING (organization_id = get_my_organization_id ());

-- 3. Allow owners to remove members from their organization (but not themselves).
CREATE POLICY "Owners can remove members from their organization" ON public.profiles FOR DELETE USING (
    organization_id = get_my_organization_id ()
    AND id != auth.uid ()
    AND -- Prevent owners from deleting themselves
    (
        SELECT
            role
        FROM
            public.profiles
        WHERE
            id = auth.uid ()
            AND organization_id = get_my_organization_id ()
    ) = 'owner'
);