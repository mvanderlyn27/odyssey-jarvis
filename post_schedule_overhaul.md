# Post Schedule & Analytics Overhaul Plan

## 1. Summary of Understanding

This document outlines the plan to implement a major feature overhaul that includes a new post scheduling system, a refactored analytics pipeline, and a new post overview interface. The goal is to provide a more robust and integrated experience for managing and analyzing social media posts, specifically for TikTok.

The key features to be added are:

-   **Post Scheduling:** A new interface allowing users to schedule draft posts by dragging them onto a weekly calendar. This includes setting specific morning/evening times and managing posts by account.
-   **Analytics Refactor:** The existing analytics logic will be decoupled from the TikTok feature and enhanced. We will link TikTok video analytics to our internal post entries using a `post_id`. A new `post_analytics` table will be created to track performance metrics over time.
-   **Post Overview Page:** The existing `InboxPage` will be transformed into a comprehensive Post Overview. It will feature a new monthly calendar view for high-level KPI analysis, followed by the existing accordion layout for posts in different states (Ready to Publish, Published, Failed).
-   **Post Detail Page:** A new, dedicated `PostDetailPage` will be created. This page will conditionally render either a `PostDraftEditor` component (for non-published posts) or a `PublishedPostView` component (for published posts), providing a tailored experience based on the post's status.

This overhaul will involve database schema changes, a single consolidated migration, new and modified Supabase edge functions, cron jobs, and significant frontend development, leveraging best-practice libraries for UI and animations.

## 2. System Design

### 2.1. Database Schema Changes

We will introduce one new table and modify the existing `posts` table.

**`posts` Table Modifications:**

-   Add a new column `post_id` (TEXT, nullable, unique): This will store the unique identifier of the post from the social media platform (e.g., TikTok's video ID). This will be used to link our internal post record with the live post.
-   Add a new column `scheduled_at` (TIMESTAMPTZ, nullable): This will store the exact date and time a post is scheduled to be published.
-   Add a new column `created_in_jarvis` (BOOLEAN, default: `true`): This will differentiate posts created within our app from those synced from TikTok.
-   Update the `status` enum to include a new `SCHEDULED` state. The new flow will be `DRAFT` -> `SCHEDULED` -> `INBOX` -> `PROCESSING` -> `PUBLISHED` / `FAILED`.

**New Table: `post_analytics`**

This table will store time-series data for post performance.

| Column      | Type        | Description                               |
| :---------- | :---------- | :---------------------------------------- |
| `id`        | `uuid`      | Primary Key                               |
| `post_id`   | `uuid`      | Foreign Key to `posts.id`                 |
| `created_at`| `timestamptz`| Timestamp of the analytics snapshot       |
| `views`     | `integer`   | Total views at the time of the snapshot   |
| `likes`     | `integer`   | Total likes at the time of the snapshot   |
| `comments`  | `integer`   | Total comments at the time of the snapshot|
| `shares`    | `integer`   | Total shares at the time of the snapshot  |

### 2.2. Backend (Supabase)

**Edge Functions:**

1.  **`tiktok-webhook` (Modification):**
    -   When a `publish` event is received, it will intelligently extract the post identifier (`video_id` for videos, `post_id` for slides) and update the corresponding record in the `posts` table, setting our generic `post_id` field.

2.  **Analytics Backend & Sync Strategy:**
    -   **Sync on Account Link:** When a user links a new TikTok account, we will trigger a one-time background job. This job will use the `video/list/` endpoint to fetch all existing videos for that account. For each video found, it will create a corresponding record in our `posts` table with `created_in_jarvis` set to `false`.
    -   **`sync-tiktok-videos` (New Manual Trigger Function):** This new edge function will be triggered by a "Sync" button on the `TikTokAccountsPage`. It will perform the same logic as the initial sync, finding any new videos on TikTok and creating placeholder posts for them in our database.
    -   **Frontend Data Flow:** The `TikTokAnalyticsPage` and `TikTokVideosPage` will now first query our `posts` table to get the list of known `post_id`s for a user. This list will then be passed to the `tiktok-bulk-video-details` function to get fresh analytics data. This makes our app faster and our database the source of truth.
    -   **`tiktok-bulk-video-details` (New Function):** This remains the core analytics function. It will accept an array of `post_id`s from our frontend, group them by account, and fetch their details in parallel, batched requests using the efficient `video/query/` endpoint.
    -   **`tiktok-video-list` (Deprecate):** The old `tiktok-video-list` function, which was used to fetch all videos on every page load, will be deprecated and removed.
    -   **Security:**
        -   For functions invoked by the client (like `tiktok-bulk-user-stats`), we will rely on Supabase's built-in Row Level Security (RLS), which uses the user's auth context automatically.
        -   For the cron job, the function will be invoked with the `service_role` key, allowing it to bypass RLS to query all published posts across all users.

3.  **`fetch-post-analytics` (Cron Job):**
    -   Runs every 5 minutes.
    -   Uses the `service_role` key to query all `posts` with a `PUBLISHED` status and a non-null `post_id`, joining with `tiktok_accounts` to get the necessary credentials.
    -   It will call the new, highly parallelized **`tiktok-bulk-video-details`** function with the list of posts.
    -   It will then insert new rows into the `post_analytics` table with the fetched data.

3.  **`publish-scheduled-posts` (New Cron Job):**
    -   Runs every minute.
    -   Queries for all posts with a `SCHEDULED` status where `scheduled_at` is in the past.
    -   For each post found, it will trigger the publishing process (e.g., move it to the inbox by changing its status to `INBOX`).

### 2.3. Frontend Architecture

**New Feature Folders:**

-   `src/features/analytics`: To house the refactored analytics components, hooks, and API calls.
-   `src/features/scheduling`: For components related to the new scheduling interface.
-   `src/features/overview`: For components related to the new post overview calendar.

**Libraries and Tooling:**

-   **Drag and Drop:** We will use `dnd-kit` for implementing the drag-and-drop functionality in the scheduling calendar, as it is a lightweight, performant, and accessible library.
-   **Animations:** We will use `framer-motion` to add fluid animations and transitions throughout the new features, enhancing the user experience.
-   **UI:** The left side panel will be updated to support a dark mode theme.

**Page Modifications & Creation:**

-   `src/pages/PostSchedulePage.tsx` (New): The main page for scheduling posts.
-   `src/pages/InboxPage.tsx` (Modified): Will be repurposed as the "Post Overview" page.
-   `src/pages/PostDetailPage.tsx` (New): A new page that will act as a container for viewing a post.

**Key Components:**

-   `PostDraftEditor.tsx` (New/Refactored): The existing `PostEditor` logic will be moved into this component, which will be rendered by `PostDetailPage` for non-published posts.
-   `PublishedPostView.tsx` (New): A new component for displaying the analytics, KPIs, and read-only asset view for published posts.
-   `DraftsList.tsx`: A horizontally scrollable list of posts with `DRAFT` status.
-   `ScheduleCalendar.tsx`: A weekly calendar view with drag-and-drop functionality for scheduling.
-   `OverviewCalendar.tsx`: A monthly calendar view displaying daily KPIs.
-   `AnalyticsChart.tsx`: A component to visualize the time-series data from the `post_analytics` table.

**State Management:**

-   We will use a Zustand store (`useScheduleStore`) to manage the user-configurable morning and evening times for scheduling. This will persist to local storage.
-   `react-query` will continue to be used for server state management, including fetching posts, analytics data, and KPIs.

**Routing (`App.tsx`):**

-   The `/posts` route will be repurposed for the new scheduling page, rendering `PostSchedulePage`.
-   The `/inbox` route will now serve as the "Post Overview" page.
-   The `/posts/:id` route will now point to the new `PostDetailPage.tsx`.

## 3. To-Do List

### Backend & Database
- [ ] Create a single, comprehensive Supabase migration script that:
- Adds `post_id` (TEXT), `scheduled_at` (TIMESTAMPTZ), and `created_in_jarvis` (BOOLEAN) columns to the `posts` table.
- Updates the `status` enum to include `SCHEDULED`.
- Creates the new `post_analytics` table.
- [ ] **Backend:** Implement the one-time video sync process within the `tiktok-auth` callback function.
- [ ] **Backend:** Create the new `sync-tiktok-videos` edge function for manual refreshing.
- [ ] **Backend:** Create the new `tiktok-bulk-video-details` edge function.
- [ ] **Backend:** Deprecate the old `tiktok-video-list`, `tiktok-video-details`, and `tiktok-user-stats` functions.
- [ ] **Backend:** Create the `publish-scheduled-posts` edge function.
- [ ] **Backend:** Set up a cron job (`fetch-post-analytics`) to call `tiktok-bulk-video-details` every 5 minutes.
- [ ] **Backend:** Set up a cron job to run `publish-scheduled-posts` every minute.
- [ ] **Frontend:** Add a "Sync Videos" button to the `TikTokAccountsPage` that calls the `sync-tiktok-videos` function.
- [ ] **Frontend:** Update the analytics pages (`TikTokAnalyticsPage`, `TikTokVideosPage`) to use the new data flow:
    -   First, fetch post records from the Supabase `posts` table.
    -   Then, pass the `post_id`s to the `tiktok-bulk-video-details` function to get the latest analytics.

### Frontend

**Core Structure & Refactoring**
- [x] Create new feature folders: `analytics`, `scheduling`, `overview`.
- [ ] Move relevant analytics logic from `features/tiktok` and `pages/TikTokAnalyticsPage.tsx` to the new `features/analytics` folder.
- [x] Update `App.tsx` with the updated routes (`/posts` for scheduling, `/inbox` for overview, and `/drafts` for drafts).
- [x] Update `SideMenu.tsx` to reflect the new page structure and add a dark mode theme.

**Post Scheduling Feature (`/posts`)**
- [x] Create `PostSchedulePage.tsx` and route it to `/posts`.
- [x] Create the `useScheduleStore` with Zustand for managing morning/evening times.
- [x] Create the `DraftsList` component to display draggable draft posts.
- [x] Create the `ScheduleCalendar` component with a weekly view and drop zones for each account/day/slot.
- [ ] Implement drag-and-drop functionality using `dnd-kit` or a similar library.
- [x] Implement the API mutation to update a post's status to `SCHEDULED` and set `scheduled_at` when dropped on the calendar.

**Post Overview Feature (`/inbox`)**
- [ ] Modify `InboxPage.tsx` to include the new `OverviewCalendar` component above the existing accordion.
- [ ] Create the `OverviewCalendar` component with a monthly view.
- [ ] Create an API endpoint and hook to fetch aggregated daily KPIs for the calendar view.
- [ ] Implement the logic to display posts for a selected day within the calendar.

**Post Detail Page (`/posts/:id`)**
- [ ] Create the new `PostDetailPage.tsx`.
- [ ] Implement logic in `PostDetailPage` to fetch the post and conditionally render `PostDraftEditor` or `PublishedPostView` based on its status.
- [ ] Refactor the existing `PostEditor` into a new `PostDraftEditor` component.
- [ ] Create the `PublishedPostView` component to display:
    -   Read-only post assets.
    -   `Clone` and `Delete` actions.
    -   Time-series analytics from the `post_analytics` table.
    -   The `AnalyticsChart` component (using a library like Recharts or Chart.js) to visualize performance.
    -   KPIs and a link to the live post.

**Existing Page Modifications**
- [ ] Update `TikTokAnalyticsPage.tsx` to link to the `/posts/:id` route when a video is clicked, if it's associated with a post in our database.
- [ ] Update `TikTokAccountsPage.tsx` to do the same for any video lists displayed there.
- [ ] Modify the post creation flow (`NewPostPage.tsx`, `PostEditor.tsx`) to ensure new posts start with the `DRAFT` status.
