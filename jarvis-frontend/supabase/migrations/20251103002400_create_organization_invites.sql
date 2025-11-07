-- Create a status enum for invites
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
        CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'declined');
    END IF;
END$$;

-- Create the organization_invites table
CREATE TABLE IF NOT EXISTS
    public.organization_invites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        organization_id UUID NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
        invited_by_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        role public.organization_role NOT NULL,
        status public.invite_status NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW ()
    );

-- Add RLS to the organization_invites table
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_invites
-- Organization members can see invites for their organization.
CREATE POLICY "Members can view invites for their organization" ON public.organization_invites FOR
SELECT
    USING (
        organization_id = (
            SELECT
                organization_id
            FROM
                public.profiles
            WHERE
                id = auth.uid ()
        )
    );

-- Organization owners can create invites.
CREATE POLICY "Owners can create invites" ON public.organization_invites FOR INSERT
WITH
    CHECK (
        organization_id = (
            SELECT
                organization_id
            FROM
                public.profiles
            WHERE
                id = auth.uid ()
        )
        AND (
            SELECT
                role
            FROM
                public.profiles
            WHERE
                id = auth.uid ()
        ) = 'owner'
    );

-- Users can update their own invites (to accept or decline).
CREATE POLICY "Users can update their own invites" ON public.organization_invites FOR
UPDATE USING (
    email = (
        SELECT
            email
        FROM
            auth.users
        WHERE
            id = auth.uid ()
    )
);
