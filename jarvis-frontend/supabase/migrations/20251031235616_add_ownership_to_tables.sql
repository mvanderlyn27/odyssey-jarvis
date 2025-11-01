-- Phase 2: Core SaaS Architecture & Feature Management
-- Step 3: Add Ownership to Core Tables
-- Add user_id and organization_id to tiktok_accounts
ALTER TABLE public.tiktok_accounts
ADD COLUMN user_id UUID REFERENCES auth.users (id),
ADD COLUMN organization_id UUID REFERENCES organizations (id);

-- Add user_id and organization_id to posts
ALTER TABLE public.posts
ADD COLUMN user_id UUID REFERENCES auth.users (id),
ADD COLUMN organization_id UUID REFERENCES organizations (id);

-- Add a constraint to ensure that either user_id or organization_id is set, but not both
ALTER TABLE public.tiktok_accounts ADD CONSTRAINT user_or_org_ownership CHECK (
    (
        user_id IS NOT NULL
        AND organization_id IS NULL
    )
    OR (
        user_id IS NULL
        AND organization_id IS NOT NULL
    )
);

ALTER TABLE public.posts ADD CONSTRAINT user_or_org_ownership CHECK (
    (
        user_id IS NOT NULL
        AND organization_id IS NULL
    )
    OR (
        user_id IS NULL
        AND organization_id IS NOT NULL
    )
);