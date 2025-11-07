-- Create an enum type for organization roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'organization_role') THEN
        CREATE TYPE public.organization_role AS ENUM ('owner', 'member');
    END IF;
END$$;

-- Add a role column to the profiles table using the new enum type.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role public.organization_role NOT NULL DEFAULT 'member';
