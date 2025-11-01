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
        - [ ] Implement client-side video processing (e.g., resizing, compression) before uploading to Supabase Storage.
        - [x] When creating a post asset, include an `asset_type` field ('photo' or 'video').
    - [x] **Database Schema (`post_assets`)**:
        - [x] Create a migration to add an `asset_type` column to the `post_assets` table.
    - [ ] **Backend Logic (Edge Function)**:
        - [ ] Instead of creating a new `process-video` function, refactor the existing `process-post-asset` function to handle both asset types.
        - [ ] The function will use the `asset_type` to determine which TikTok endpoint to use for publishing.
    - [x] **UI Components**:
        - [x] Develop video-specific UI components, such as a video player for previews and thumbnails in the post list.

- [ ] **SaaS Landing Page**
    - [ ] Create `jarvis-frontend/src/pages/LandingPage.tsx`.
    - [ ] Update routing in `jarvis-frontend/src/App.tsx`.

- [ ] **Organization Management UI**
    - [ ] Build out `jarvis-frontend/src/features/organization/` feature.
    - [ ] Create `jarvis-frontend/src/pages/SettingsPage.tsx`.

- [ ] **Rate-Limit Manual TikTok Video Import**
    - [ ] **Objective**: Allow users to import existing TikToks not posted via Jarvis, while preventing abuse of the `sync-tiktok-videos` function.
    - [ ] **Database**: Add a `last_video_import_at` timestamp column to the `tiktok_accounts` table.
    - [ ] **Backend**:
        - [ ] Modify the `sync-tiktok-videos` Edge Function to check the `last_video_import_at` timestamp.
        - [ ] If the last import was less than 7 days ago, return an error.
        - [ ] On successful import, update the timestamp to the current time.
    - [ ] **Frontend**:
        - [ ] Update the UI on the `TikTokAccountDetailsPage` to disable the import button if an import is not allowed.
        - [ ] Display the next available import time to the user.
    - [ ] **Admin Override**: Note that manual overrides can be performed by a database administrator by updating the `last_video_import_at` field.

---

## Phase 6: User and Organization Management

- [ ] **Implement Organization Roles**
    - [ ] **Database**: Add a `role` column to the `profiles` table (e.g., 'owner', 'member').
    - [ ] **Backend (RLS)**: Update RLS policies to grant owners administrative privileges over their organization.
    - [ ] **Frontend**: Build UI for organization owners to invite and manage members.

- [ ] **Implement Jarvis Admin Role**
    - [ ] **Database**: Create a new table `jarvis_admins` to store the `user_id` of admin accounts.
    - [ ] **Backend**: Create a helper function `is_jarvis_admin(user_id)` that returns true if the user is in the admin table.
    - [ ] **Frontend**: Build a separate admin dashboard for managing tenants, subscriptions, and troubleshooting.

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
