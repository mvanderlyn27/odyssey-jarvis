# SaaS Refactor: Detailed Task Checklist (v3)

This document provides a detailed, file-by-file checklist for refactoring the application into a scalable, multi-tenant SaaS product with a flexible, tier-based feature system.

---

## Phase 1: Tiered Analytics Backend

**Objective**: Re-architect the analytics system to support different data granularity levels based on subscription plans and ensure long-term scalability.

- [x] **Establish Multi-Tenant Analytics Schema**
- [x] **Implement Tier-Based Aggregation & Retention Logic**

---

## Phase 2: Core SaaS Architecture & Feature Management

**Objective**: Implement a flexible, multi-tenant architecture for managing users, organizations, and subscription plans with scalable feature limits.

- [x] **Create Core SaaS Schema with Flexible Plans**
- [x] **Seed Subscription Plans with Feature Definitions**
- [x] **Add Ownership to Core Tables**

---

## Phase 3: Billing and Feature Enforcement

**Objective**: Integrate Stripe, manage free trials, and enforce plan-based feature limits throughout the application.

- [x] **Enhance Database Schema for Detailed Billing**
- [x] **Implement Stripe Integration with Trial Support**
- [x] **Implement Feature Gating & Limit Enforcement**

---

## Phase 4: Security and Backend Hardening

**Objective**: Secure the application using Supabase's Row Level Security (RLS).

- [x] **Implement RLS Policies**
- [x] **Refactor Analytics Cron Job for Tenant Awareness**

---

## Phase 5: UI/UX and Feature Enhancements

- [x] **Scheduler State Refactor**
- [x] **Full Video Support**
    - [x] **Objective**: Unify the photo and video upload logic for a streamlined user experience, ensuring videos are optimized on the client and processed correctly by the backend.
    - [x] **Client-Side Logic**:
        - [x] Create a new utility function in `jarvis-frontend/src/features/posts/utils.ts` to generate a thumbnail from the first frame of a video.
        - [x] Modify the existing upload components to accept both image and video files, enforcing a single file limit for videos while allowing multiple files for photos.
        - [x] Implement client-side video processing (e.g., resizing, compression) before uploading to Supabase Storage.
        - [x] When creating a post asset, include an `asset_type` field ('photo' or 'video').
    - [x] **Database Schema (`post_assets`)**:
        - [x] Create a migration to add an `asset_type` column to the `post_assets` table.
    - [x] **Backend Logic (Edge Function)**:
        - [x] Instead of creating a new `process-video` function, refactor the existing `process-post-init` function to handle both asset types.
        - [x] The function will use the `asset_type` to determine which TikTok endpoint to use for publishing.
    - [x] **UI Components**:
        - [x] Develop video-specific UI components, such as a video player for previews and thumbnails in the post list.

- [ ] **Hybrid Sign-Up, Verification & Purchase Flow**
    - [ ] **Objective**: Implement a flexible, dual-path sign-up and purchase flow to cater to both high-intent "buyers" and "explorers" who want to try a freemium version first. This involves creating two distinct user journeys that converge into a single, unified application experience.
    - [ ] **Path 1: The "Buyer" Express Lane (Pricing Page -> Purchase)**
        - [ ] **`LandingPage.tsx` / `PublicHeader.tsx`**: Ensure a prominent "Pricing" button is present in the main navigation.
        - [ ] **`PricingPage.tsx` (New Page)**:
            - [ ] Create a new page to display subscription plans (e.g., Free, Pro, Business).
            - [ ] Implement a Monthly/Annual billing toggle with clear savings displayed.
            - [ ] Highlight a "Most Popular" plan to guide user choice.
            - [ ] Each paid plan will have a "Choose Plan" button that navigates to a sign-up flow, passing the selected `priceId`.
        - [ ] **`SignUpPage.tsx` Refactor**:
            - [ ] Modify the sign-up page to be context-aware. When a `priceId` is present in the URL, the title should reflect the chosen plan (e.g., "Create your Pro Account").
            - [ ] Upon successful account creation, redirect the user *directly* to the `PurchasePage`.
        - [ ] **`PurchasePage.tsx`**:
            - [ ] This page will now serve as the immediate checkout step for the buyer path. It should display the order summary for the selected plan.
            - [ ] Integrate Stripe Elements for secure payment processing.
        - [ ] **Post-Payment Flow**:
            - [ ] After successful payment, the user's subscription is activated in the backend.
            - [ ] The user is logged in and lands in the fully unlocked application. The email verification can happen post-payment without blocking access.
    - [ ] **Path 2: The "Explorer" Freemium Lane (Sign Up -> Freemium)**
        - [ ] **`LandingPage.tsx` / `PublicHeader.tsx`**: Ensure a "Sign Up Free" button is present.
        - [ ] **`SignUpPage.tsx`**: When no `priceId` is passed, this page functions as the entry point for the freemium plan.
        - [ ] **Email Verification**: Maintain the current flow where users must verify their email before gaining full access to the freemium tier.
        - [ ] **Freemium Experience**:
            - [ ] Once logged in, the user is on the "Free" plan with strategic limitations applied (e.g., max 1 social account, limited posts).
            - [ ] The application will be populated with sample data or guided prompts to demonstrate value.

- [ ] **In-App Upsell & Feature Gating UI**
    - [ ] **Objective**: Develop a suite of reusable UI components to visually gate premium features and create contextual prompts that encourage freemium users to upgrade.
    - [ ] **`useUserPlanFeatures` Hook (Enhancement)**:
        - [ ] Refactor the hook that checks user permissions to be the central source of truth for feature access. It should return not just a boolean, but also metadata like the user's current limit and the limit of the next tier.
    - [ ] **Feature Gating Components**:
        - [ ] Create a `LockedFeature` wrapper component that can disable buttons or UI elements, showing a tooltip or popover on interaction that explains the feature and prompts an upgrade.
        - [ ] Implement visual cues for locked features (e.g., greyed-out styles, lock icons).
    - [ ] **Upsell Modals & Banners**:
        - [ ] Create a generic `UpgradeModal` that can be triggered from anywhere in the app, displaying the benefits of upgrading.
        - [ ] Design non-intrusive banners to place on pages with premium features (e.g., "Unlock real-time analytics. [Upgrade to Pro]").
        - [ ] All upgrade CTAs should lead to the `PricingPage`.

- [ ] **Subscription & Billing Management UI**
    - [ ] **Objective**: Provide users with a clear and simple interface to manage their subscription, view invoices, and update payment details.
    - [ ] **`SettingsPage.tsx` (Enhancement)**:
        - [ ] Add a new "Billing" or "Subscription" tab to the user settings page.
    - [ ] **`SubscriptionManagement.tsx` (New Component)**:
        - [ ] Display the user's current plan, billing cycle (monthly/annual), and next renewal date.
        - [ ] Provide a button to "Manage Subscription" which redirects to the Stripe Customer Portal for secure management of payment methods, invoices, and cancellations.
        - [ ] Implement the backend logic to generate a Stripe Customer Portal session for the user.
    - [ ] **Organization Billing**:
        - [ ] For organization owners, the billing UI should reflect the organization's subscription, including the number of seats and any add-ons.
- [ ] **First-Time User Experience Wizard**
    - [ ] **Objective**: Create a wizard that guides new users through the initial setup process after they have signed up (either for a free or paid plan).
    - [ ] **Wizard Steps**:
        - [ ] Welcome message.
        - [ ] Prompt to connect their first social account.
        - [ ] Guide to create their first post.
        - [ ] Introduction to the scheduling calendar.
- [x] **SaaS Landing Page**
    - [x] Create `jarvis-frontend/src/pages/LandingPage.tsx`.
    - [x] Update routing in `jarvis-frontend/src/App.tsx`.

- [x] **Organization Management UI**
    - [x] Build out `jarvis-frontend/src/features/organization/` feature. to allow users to manage organizations, 
    - [x] Create `jarvis-frontend/src/pages/SettingsPage.tsx`.

- [x] **Rate-Limit Manual TikTok Video Import**
    - [x] **Objective**: Allow users to import existing TikToks not posted via Jarvis, while preventing abuse of the `sync-tiktok-videos` function.
    - [x] **Database**: Add a `last_video_import_at` timestamp column to the `tiktok_accounts` table.
    - [x] **Backend**:
        - [x] Modify the `sync-tiktok-videos` Edge Function to check the `last_video_import_at` timestamp.
        - [x] If the last import was less than 7 days ago, return an error.
        - [x] On successful import, update the timestamp to the current time.
    - [x] **Frontend**:
        - [x] Update the UI on the `TikTokAccountDetailsPage` to disable the import button if an import is not allowed.
        - [x] Display the next available import time to the user.
    - [x] **Admin Override**: Note that manual overrides can be performed by a database administrator by updating the `last_video_import_at` field.

---

## Phase 6: User and Organization Management

- [x] **Implement Organization Roles**
    - [x] **Database**: Add a `role` column to the `profiles` table (e.g., 'owner', 'member').
    - [x] **Backend (RLS)**: Update RLS policies to grant owners administrative privileges over their organization.
    - [x] **Frontend**: Build UI for organization owners to invite and manage members.

- [x] **Implement Jarvis Admin Role**
    - [x] **Database**: Create a new table `jarvis_admins` to store the `user_id` of admin accounts.
    - [x] **Backend**: Create a helper function `is_jarvis_admin(user_id)` that returns true if the user is in the admin table.
    - [x] **Frontend**: Build a separate admin dashboard for managing tenants, subscriptions, and troubleshooting.

---

## Phase 7: Analytics and Monitoring

- [ ] **Integrate PostHog for Product Analytics**
    - [ ] **Frontend**: Add the PostHog snippet and configure it to capture user events.
    - [ ] **Backend**: Use the PostHog SDK in Edge Functions to capture key backend events.
    - [ ] **Data Privacy**: Ensure compliance with data privacy regulations (e.g., GDPR, CCPA).

---

## Phase 8: Pre-Launch Checklist

- [ ] **Manual Testing**
- [ ] **Policy Review**

---
---

# Phase 9: Real-time Collaboration & Notifications

**Objective**: Enhance user experience with real-time updates and collaborative features, starting with post scheduling and organization invites.

- [ ] **Database Schema for Notifications**
    - [ ] Create a new migration for a `notifications` table (e.g., for invites, system alerts).
    - [ ] Create a new migration for an `organization_invites` table to manage pending invites.
- [ ] **Enable Supabase Realtime**
    - [ ] Enable Realtime on the `posts` table to allow for a "multiplayer" scheduling experience.
    - [ ] Enable Realtime on the new `notifications` and `organization_invites` tables.
- [ ] **Frontend Implementation**
    - [ ] Refactor the `PostSchedulePage` to subscribe to real-time updates for the `posts` table.
    - [ ] Build a new UI component for displaying notifications.
    - [ ] Integrate the notification component into the main application layout.

---

# Phase 10: TanStack Query & Caching Refactor

**Objective**: Optimize frontend performance and data consistency by establishing TanStack Query as the single source of truth and implementing a robust caching strategy.

- [ ] **Audit Existing Queries**
    - [ ] Review all `useQuery` hooks across the application.
    - [ ] Define and apply appropriate `staleTime` and `cacheTime` to reduce unnecessary API calls.
- [ ] **Implement Query Invalidation**
    - [ ] Ensure all mutations (`useMutation`) correctly invalidate relevant queries `onSuccess` to keep data fresh.
    - [ ] Refactor any manual refresh buttons (e.g., `window.location.reload()`) to use `queryClient.invalidateQueries` or `refetch`.
- [ ] **Remove Legacy State Management**
    - [ ] Audit and remove any remaining client-side state that duplicates server state (e.g., old Zustand stores).

---

# Phase 11: Feature Audit & Refactor

**Objective**: Ensure all existing features are fully compatible with the new multi-tenant architecture, edge functions, and data flows.

- [ ] **`accounts` Feature**:
    - [ ] Verify that account management respects the `max_accounts` limit from the user's plan.
- [ ] **`analytics` Feature**:
    - [ ] Ensure all analytics components correctly fetch and display data based on the `analytics_granularity` feature.
- [ ] **`billing` Feature**:
    - [ ] Build the UI for subscription management (upgrade, downgrade, cancel).
- [ ] **`organizations` Feature**:
    - [ ] Build the UI for creating organizations and inviting members.
- [ ] **`overview` Feature**:
    - [ ] Ensure the overview dashboard correctly aggregates data from all connected accounts.
- [ ] **`post-variant-generator` Feature**:
    - [ ] Verify that this feature is compatible with the new RLS policies.
- [ ] **`posts` Feature**:
    - [ ] Double-check that all post creation, editing, and publishing flows work with the new backend logic.
- [ ] **`scheduling` Feature**:
    - [ ] Address the optimistic update flickering issue in the `ScheduleCalendar`.
- [ ] **`tiktok` Feature**:
    - [ ] Ensure all TikTok account connection and data sync flows are functioning correctly.

---

# Phase 12: Final Testing & Validation

**Objective**: Conduct a comprehensive testing cycle to ensure the application is stable, secure, and ready for users.

- [ ] **New Functionality Testing**
    - [ ] **Subscription Management**: Test the full lifecycle (trial, upgrade, downgrade, cancellation).
    - [ ] **Organization Invites**: Test inviting, accepting, and managing members.
    - [ ] **Real-time Scheduling**: Test multiplayer scheduling with two concurrent users.
    - [ ] **Feature Limits**: Test all plan-based limits (`max_accounts`, `daily_direct_post_limit`, etc.).
- [ ] **Regression Testing**
    - [ ] **Core User Flows**:
        - [ ] User registration and login.
        - [ ] Connecting a TikTok account.
        - [ ] Creating and editing a draft post.
        - [ ] Scheduling a post.
        - [ ] Publishing a post directly.
        - [ ] Viewing post and account analytics.
    - [ ] **Edge Cases**:
        - [ ] Test behavior when a user's trial expires.
        - [ ] Test behavior when a payment fails.
        - [ ] Test handling of expired TikTok access tokens.
