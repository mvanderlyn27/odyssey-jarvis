Of course. Here is a comprehensive plan, formatted as saas_refactor_doc.md, to guide your coding LLM agent through the process of refactoring your application for a full SaaS release.

SaaS Refactor and Release Plan

Objective: Evolve the current application into a multi-tenant, subscription-based SaaS product. This document outlines the necessary database schema changes, backend logic implementation, security policies, and frontend updates required for launch.

Phase 1: Core SaaS Architecture (Users, Organizations & Plans)

This phase establishes the foundational schema for a multi-tenant application. All data must be owned by either a user (for the Indie plan) or an organization (for the Premium plan).

1.1. New Table: organizations

Stores information about a user-created organization.

Action: Create the organizations table.

```sql
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL
);
-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
```
1.2. New Table: profiles

This table extends auth.users to link users to organizations and assign roles.

Action: Create the profiles table.

```sql
CREATE TYPE public.user_role AS ENUM ('admin', 'member');

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    role public.user_role DEFAULT 'member'::public.user_role
);
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```
1.3. New Table: plans & subscriptions

These tables will manage the subscription tiers and link them to Stripe for billing.

Action: Create the tables to manage billing plans and user subscriptions.

```sql
CREATE TYPE public.subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'unpaid');

CREATE TABLE public.plans (
    id TEXT PRIMARY KEY, -- e.g., 'indie' or 'premium'
    name TEXT NOT NULL,
    price_id TEXT, -- Stripe Price ID
    -- Define limits for each plan
    max_accounts INT DEFAULT 1,
    max_posts_per_day INT DEFAULT 5,
    analytics_granularity TEXT DEFAULT 'daily' -- 'daily' or 'hourly'
);

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID REFERENCES public.organizations(id), -- NULL for Indie users
    plan_id TEXT NOT NULL REFERENCES public.plans(id),
    status public.subscription_status NOT NULL,
    -- Stripe specific columns
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Ensure one active subscription per org or user
    UNIQUE(organization_id),
    UNIQUE(user_id)
);
-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
```
Action: Insert the plan definitions.

```sql
-- Insert the plan details into the plans table.
-- Replace 'price_...' with your actual Stripe Price IDs.
INSERT INTO public.plans (id, name, price_id, max_accounts, max_posts_per_day, analytics_granularity)
VALUES
    ('indie', 'Indie', 'price_indie_monthly', 1, 5, 'daily'),
    ('premium', 'Premium', 'price_premium_monthly', 10, 100, 'hourly');
```
1.4. Modify Existing Tables for Ownership

Update tiktok_accounts and posts to associate them with either a user or an organization.

Action: Add user_id and organization_id columns to relevant tables.

```sql
ALTER TABLE public.tiktok_accounts
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD CONSTRAINT chk_owner CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR
    (user_id IS NULL AND organization_id IS NOT NULL)
);

ALTER TABLE public.posts
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
ADD CONSTRAINT chk_owner CHECK (
    (user_id IS NOT NULL AND organization_id IS NULL) OR
    (user_id IS NULL AND organization_id IS NOT NULL)
);
```
Phase 2: Analytic Improvements

Implement the hourly, daily, weekly, and monthly aggregation strategy.

2.1. Create Aggregation Tables

Action: Create post_analytics_hourly and post_analytics_daily tables.

```sql
-- Hourly aggregates
CREATE TABLE public.post_analytics_hourly (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    hour TIMESTAMPTZ NOT NULL,
    views_latest BIGINT,
    likes_latest BIGINT,
    comments_latest BIGINT,
    shares_latest BIGINT,
    UNIQUE (post_id, hour)
);

-- Daily aggregates
CREATE TABLE public.post_analytics_daily (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    day DATE NOT NULL,
    views BIGINT,
    likes BIGINT,
    comments BIGINT,
    shares BIGINT,
    UNIQUE (post_id, day)
);
```
2.2. Implement Aggregation and Cleanup Logic

Action: Create database functions for aggregation and data retention, and schedule them with pg_cron.

```sql
-- This combines the previous plan's steps into a single script.
-- 1. Function to aggregate raw data into the hourly table.
CREATE OR REPLACE FUNCTION aggregate_hourly_analytics()
RETURNS void AS $$
BEGIN
  INSERT INTO public.post_analytics_hourly (hour, post_id, views_latest, likes_latest, comments_latest, shares_latest)
  SELECT
    date_trunc('hour', pa.created_at) AS hour,
    pa.post_id,
    MAX(pa.views) AS views_latest,
    MAX(pa.likes) AS likes_latest,
    MAX(pa.comments) AS comments_latest,
    MAX(pa.shares) AS shares_latest
  FROM
    public.post_analytics pa
  WHERE
    pa.post_id IS NOT NULL AND pa.created_at >= date_trunc('hour', NOW() - INTERVAL '2 hours')
  GROUP BY
    hour, pa.post_id
  ON CONFLICT (post_id, hour) DO UPDATE
  SET
    views_latest = EXCLUDED.views_latest,
    likes_latest = EXCLUDED.likes_latest,
    comments_latest = EXCLUDED.comments_latest,
    shares_latest = EXCLUDED.shares_latest;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to aggregate hourly data into the daily table.
CREATE OR REPLACE FUNCTION aggregate_daily_analytics()
RETURNS void AS $$
BEGIN
  INSERT INTO public.post_analytics_daily (day, post_id, views, likes, comments, shares)
  SELECT
      (pah.hour AT TIME ZONE 'UTC')::date AS day,
      pah.post_id,
      MAX(pah.views_latest) AS views,
      MAX(pah.likes_latest) AS likes,
      MAX(pah.comments_latest) AS comments,
      MAX(pah.shares_latest) AS shares
  FROM public.post_analytics_hourly pah
  WHERE pah.hour >= date_trunc('day', NOW() - INTERVAL '1 day') AT TIME ZONE 'UTC'
    AND pah.hour < date_trunc('day', NOW()) AT TIME ZONE 'UTC'
  GROUP BY day, pah.post_id
  ON CONFLICT (post_id, day) DO UPDATE
  SET
      views = EXCLUDED.views,
      likes = EXCLUDED.likes,
      comments = EXCLUDED.comments,
      shares = EXCLUDED.shares;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to delete old raw data.
CREATE OR REPLACE FUNCTION delete_old_raw_analytics()
RETURNS void AS $$
BEGIN
  DELETE FROM public.post_analytics WHERE created_at < NOW() - INTERVAL '2 days';
END;
$$ LANGUAGE plpgsql;

-- 4. Enable pg_cron and schedule jobs.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
-- Run hourly aggregation every hour at 5 mins past
SELECT cron.schedule('hourly-aggregation', '5 * * * *', 'SELECT aggregate_hourly_analytics();');
-- Run daily aggregation every day at 1:00 AM UTC
SELECT cron.schedule('daily-aggregation', '0 1 * * *', 'SELECT aggregate_daily_analytics();');
-- Run cleanup every day at 3:00 AM UTC
SELECT cron.schedule('cleanup-raw-analytics', '0 3 * * *', 'SELECT delete_old_raw_analytics();');
```
2.3. Update Analytics Functions

The existing get_daily_kpis function needs to be updated, and new functions for weekly/monthly analytics should be created. These will query the new, efficient aggregation tables.

Action: Rewrite get_daily_kpis and create new functions.

```sql
-- Rewrite this function to use the new daily aggregate table.
-- This will be much faster.
CREATE OR REPLACE FUNCTION get_daily_kpis(p_account_ids TEXT[], p_start_date DATE, p_end_date DATE)
RETURNS TABLE(...) AS $$
-- ... function logic using post_analytics_daily ...
$$ LANGUAGE plpgsql;

-- Create similar functions for weekly and monthly trends.
CREATE OR REPLACE FUNCTION get_weekly_kpis(p_account_ids TEXT[], p_start_date DATE, p_end_date DATE)
RETURNS TABLE(...) AS $$
-- ... logic to group post_analytics_daily by week ...
$$ LANGUAGE plpgsql;
```
Phase 3: Payment and Billing Integration
3.1. Stripe Webhooks

Create an Edge Function to securely handle Stripe webhook events and update the subscriptions table.

Action: Implement a Supabase Edge Function at /api/stripe-webhook.

Functionality:

Verify the webhook signature to ensure it's from Stripe.

Handle customer.subscription.created, customer.subscription.updated, and customer.subscription.deleted events.

Update the status, stripe_subscription_id, etc., in the public.subscriptions table based on the event payload.

Handle checkout.session.completed to create the initial subscription record.

Security: Use a Supabase database client with the service_role key to bypass RLS for these backend updates.

3.2. Client-Side Payment Flow

Action: Implement the UI for plan selection and checkout.

Create a "Billing" or "Upgrade" page in the UI.

When a user chooses a plan, make a call to a new Edge Function (/api/create-checkout-session).

This Edge Function will use the Stripe Node.js library to create a Checkout Session and return the session ID to the client.

The client will use the session ID to redirect the user to the Stripe-hosted checkout page.

Phase 4: Row Level Security (RLS) & Edge Functions

Secure the application by ensuring users can only access their own data or their organization's data.

4.1. RLS Policies

Action: Define and apply RLS policies to all relevant tables.

```sql
-- Helper function to get the user's organization_id
CREATE OR REPLACE FUNCTION get_my_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT organization_id FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql;

-- Example RLS Policy for tiktok_accounts
ALTER TABLE public.tiktok_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own and their org's accounts" ON public.tiktok_accounts;
CREATE POLICY "Users can access their own and their org's accounts"
ON public.tiktok_accounts FOR ALL
USING (
  (user_id = auth.uid()) OR
  (organization_id = get_my_organization_id())
);

-- Apply similar policies to:
-- organizations, profiles, posts, post_analytics, post_analytics_hourly, etc.
-- For organizations:
CREATE POLICY "Users can see organizations they are a member of"
ON public.organizations FOR SELECT
USING (id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));
```
4.2. Update Edge Functions

Action: Refactor all Edge Functions to be RLS-aware.

Ensure that all database queries within Edge Functions are made using the user-specific Supabase client, which enforces RLS.

Do NOT use the service_role key unless absolutely necessary (like in the Stripe webhook).

When creating new resources (like a post), the function must retrieve the user's user_id or organization_id from their session and correctly assign ownership.

Phase 5: UI/UX Fixes and Enhancements
5.1. Scheduler State Refactor

Action: Refactor the post scheduler to eliminate local state in favor of a single source of truth from the database, using optimistic updates for a better user experience.

- **Problem**: The current scheduler relies on a combination of local and database state, causing scheduled posts to disappear on page refresh.
- **Solution**:
    - Remove the local state management from the scheduler component.
    - All scheduler actions (adding, moving, updating posts) should directly mutate the database via API calls.
    - Implement optimistic updates in the UI. When a user schedules a post, the UI should update immediately, assuming the database operation will succeed. If it fails, revert the change and show an error notification.
    - This ensures data persistence and a seamless user experience, even across page reloads.

5.2. Scheduler Fixes

Action: Debug and fortify the post scheduling component.

Thoroughly review the logic for handling timezones. All scheduled times should be stored in UTC (TIMESTAMPTZ) and converted to the user's local timezone only for display.

Add robust error handling and status updates. If a scheduled post fails to publish, the posts.status should be set to FAILED and posts.reason should be populated.

The UI must reflect these statuses clearly to the user.

5.3. Data Freshness Guarantee

Action: Implement UI indicators for data freshness.

On analytics dashboards, display a "Last updated: [timestamp]" message. This can be sourced from the created_at column of the latest record in the post_analytics_hourly table.

Use subtle loading states or shimmer effects when analytics data is being refetched to indicate that the view is updating.

5.4. New UI Components

Action: Build UI for new SaaS features.

Organization Management: Create a settings page where an organization owner can rename the org and manage members (invite, remove, change roles).

User Profile: Page to manage user settings.

Billing Portal: A page that shows the current plan, and links to the Stripe customer portal for managing payment methods and invoices.

5.5. SaaS Landing Page

Action: Refactor the homepage to serve as a compelling landing page for the SaaS product.

- **Content Strategy**: Develop content that clearly communicates the value proposition, features, and pricing tiers. Include sections for "Features," "Pricing," "Testimonials," and a clear "Call to Action" (e.g., "Get Started for Free").
- **Design**: Create a modern, professional design that aligns with the brand. Use high-quality visuals and a clean layout.
- **Routing**: Ensure that authenticated users are redirected to their dashboard, while unauthenticated users see the landing page. The root URL (`/`) should serve the landing page.

5.6. Full Video Support

Action: Enhance the application to provide first-class support for video content throughout the stack.

- **Backend & Storage**:
    - **Supabase Storage**: Configure a dedicated bucket for video uploads with appropriate security policies (e.g., users can only upload to their own/organization's folder).
    - **Edge Function for Processing**: Create a new Edge Function (`/api/process-video`) that is triggered on video upload. This function will handle tasks like generating thumbnails, checking video duration/format, and creating a `post_assets` record.
    - **Database Schema**: Update the `post_assets` table to include video-specific metadata, such as `duration`, `width`, `height`, and `thumbnail_url`.

- **Frontend UI**:
    - **Video Upload Component**: Build a robust file uploader that supports large video files, shows upload progress, and provides clear error feedback.
    - **Video Player**: Integrate a modern video player (e.g., Plyr, Video.js) to display videos within the application.
    - **Scheduler Integration**: Update the post scheduler and publisher components to handle video posts, allowing users to preview and schedule them just like image posts.

Phase 6: Pre-Launch and TikTok Submission
6.1. Review TikTok Policies

Action: Ensure the application is fully compliant with TikTok's terms of service.

Carefully read TikTok's Developer Policy and Platform Guidelines.

Pay close attention to data usage, privacy, and how the app is presented to users. Ensure you are not violating any branding guidelines.

6.2. Final Testing

Action: Conduct end-to-end testing of all user flows.

Test the user sign-up and onboarding process.

Test the full subscription flow (trial, upgrade, payment, cancellation).

Test the multi-user organization flow (invites, role permissions).

Verify all RLS policies are working correctly by logging in as different users from different organizations.

6.3. Submit to TikTok

Action: Prepare and submit the application for approval via the TikTok for Developers portal.
