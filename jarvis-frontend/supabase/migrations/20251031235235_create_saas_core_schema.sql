-- Phase 2: Core SaaS Architecture & Feature Management
-- Objective: Implement a flexible, multi-tenant architecture for managing users, organizations, and subscription plans with scalable feature limits.

-- Step 1: Create Core SaaS Schema with Flexible Plans

-- Create Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Profiles Table to link users to organizations
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    full_name TEXT,
    avatar_url TEXT
);

-- Create Plans Table with a flexible JSONB features column
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    features JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Subscriptions Table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    organization_id UUID REFERENCES organizations(id),
    plan_id UUID REFERENCES plans(id),
    status TEXT NOT NULL, -- e.g., 'active', 'canceled', 'past_due'
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_or_org_subscription CHECK (
        (user_id IS NOT NULL AND organization_id IS NULL) OR
        (user_id IS NULL AND organization_id IS NOT NULL)
    )
);

-- Add Foreign Key from analytics tables to organizations
ALTER TABLE post_analytics_raw ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE post_analytics_hourly ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE post_analytics_daily ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE post_analytics_monthly ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id);

ALTER TABLE account_analytics_raw ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE account_analytics_hourly ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE account_analytics_daily ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id);
ALTER TABLE account_analytics_monthly ADD CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES organizations(id);


-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
