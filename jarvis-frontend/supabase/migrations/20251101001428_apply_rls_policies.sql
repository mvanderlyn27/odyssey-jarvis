-- Phase 4: Security and Backend Hardening
-- Step 1: Implement RLS Policies

-- Enable RLS for all relevant tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_analytics_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_analytics_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_analytics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_analytics_monthly ENABLE ROW LEVEL SECURITY;

-- Helper function to get the organization_id for the current user
CREATE OR REPLACE FUNCTION get_my_organization_id()
RETURNS UUID AS $$
DECLARE
    org_id UUID;
BEGIN
    SELECT organization_id INTO org_id FROM public.profiles WHERE id = auth.uid();
    RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- Organizations: Users can only see their own organization.
CREATE POLICY "Users can view their own organization" ON public.organizations
    FOR SELECT USING (id = get_my_organization_id());

-- Profiles: Users can only see their own profile.
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

-- Subscriptions: Users can only see subscriptions linked to them or their organization.
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());

-- Plans: All authenticated users can view all plans.
CREATE POLICY "Authenticated users can view plans" ON public.plans
    FOR SELECT TO authenticated USING (true);

-- TikTok Accounts: Users can only manage accounts linked to them or their organization.
CREATE POLICY "Users can manage their own tiktok_accounts" ON public.tiktok_accounts
    FOR ALL USING (user_id = auth.uid() OR organization_id = get_my_organization_id());

-- Posts: Users can only manage posts linked to them or their organization.
CREATE POLICY "Users can manage their own posts" ON public.posts
    FOR ALL USING (user_id = auth.uid() OR organization_id = get_my_organization_id());

-- Analytics Data: Users can only see analytics data linked to them or their organization.
CREATE POLICY "Users can view their own post analytics" ON public.post_analytics_raw
    FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
CREATE POLICY "Users can view their own post analytics" ON public.post_analytics_hourly
    FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
CREATE POLICY "Users can view their own post analytics" ON public.post_analytics_daily
    FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
CREATE POLICY "Users can view their own post analytics" ON public.post_analytics_monthly
    FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());

CREATE POLICY "Users can view their own account analytics" ON public.account_analytics_raw
    FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
CREATE POLICY "Users can view their own account analytics" ON public.account_analytics_hourly
    FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
CREATE POLICY "Users can view their own account analytics" ON public.account_analytics_daily
    FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
CREATE POLICY "Users can view their own account analytics" ON public.account_analytics_monthly
    FOR SELECT USING (user_id = auth.uid() OR organization_id = get_my_organization_id());
