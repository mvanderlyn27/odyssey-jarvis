CREATE TYPE onboarding_status AS ENUM ('incomplete', 'complete');

ALTER TABLE public.profiles
DROP COLUMN has_completed_onboarding,
ADD COLUMN onboarding_status onboarding_status NOT NULL DEFAULT 'incomplete';