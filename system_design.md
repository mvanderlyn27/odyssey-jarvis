# Jarvis Internal Tool: System Design

This document outlines the system design and implementation plan for the Jarvis internal tool, a Vite-based React application.

## 1. Core Technologies

- **Framework:** Vite + React (with TypeScript)
- **Styling:** Tailwind CSS + Shadcn
- **State Management:** Zustand
- **Data Fetching:** Tanstack Query (React Query)
- **Backend:** Supabase (two separate clients for the main and marketing databases)
- **Routing:** `react-router-dom`

## 2. Project Setup and Initialization

1.  **Initialize Vite Project:**
    ```bash
    npm create vite@latest jarvis-tool --template react-ts
    cd jarvis-tool
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Install Core Libraries:**
    ```bash
    npm install zustand @tanstack/react-query @supabase/supabase-js react-router-dom zustand-middleware-persist
    ```
4.  **Setup Tailwind CSS & Shadcn:**
    - Follow the official Shadcn documentation to integrate it into the Vite project. This will also set up Tailwind CSS.
    - Initialize Shadcn: `npx shadcn-ui@latest init`

## 3. Project Structure

A modular and scalable project structure will be used:

```
/src
|-- /components
|   |-- /ui (shadcn components)
|   |-- /layout
|   |   |-- SideMenu.tsx
|   |   |-- Header.tsx
|   |-- /tiktok
|       |-- TikTokAccountManager.tsx
|       |-- PostAnalytics.tsx
|       |-- DraftCreator.tsx
|-- /lib
|   |-- supabase
|   |   |-- mainClient.ts
|   |   |-- marketingClient.ts
|   |-- utils.ts
|-- /hooks
|   |-- useTikTokPosts.ts
|-- /pages
|   |-- TikTok.tsx
|   |-- Admin.tsx
|-- /services
|   |-- tiktokAPI.ts
|-- /store
|   |-- useAppStore.ts
|-- App.tsx
|-- main.tsx
```

## 4. Supabase Integration

- **Client Setup:** Two Supabase clients will be created in `/src/lib/supabase`.
  - `jarvisClient.ts`: This client connects to the Jarvis internal tool's database. It will handle all internal data and manage user authentication (email/password) for the tool itself.
  - `adminClient.ts`: This client uses admin privileges to connect to the main production database for performing administrative tasks.
- **Environment Variables:** Supabase URLs and anon keys will be stored in `.env` files.
  - `VITE_JARVIS_SUPABASE_URL`, `VITE_JARVIS_SUPABASE_ANON_KEY`
  - `VITE_ADMIN_SUPABASE_URL`, `VITE_ADMIN_SUPABASE_ANON_KEY`

## 5. State Management (Zustand)

- A single Zustand store (`/src/store/useAppStore.ts`) will manage global state.
- **Persistence:** We will use Zustand's `persist` middleware with local storage to keep user sessions and paired TikTok account information available across browser sessions.
- **State includes:**
  - The list of paired TikTok accounts and their session data.
  - The currently selected TikTok account for operations.
  - UI state (e.g., open/closed states for modals).

## 6. Data Fetching (Tanstack Query)

- Tanstack Query will be used for all asynchronous operations, including:
  - Fetching data from our Supabase databases.
  - Interacting with the TikTok API.
- Custom hooks (e.g., `useTikTokPosts`) will encapsulate query logic, making components cleaner.
- Mutations will be used for actions like pairing accounts, creating drafts, and posting to TikTok.

## 7. Phase 1: TikTok Developer App Setup

This phase ensures the internal tool is recognized and authorized by TikTok for Developers.

### Prerequisites (Account Setup)
1.  **Create a Developer Account:** Create a TikTok developer account via the [signup page](https://developers.tiktok.com/).
2.  **Create or Join an Organization:** Create or join an organization representing the owning group of the app.

### App Connection and Configuration
3.  **Connect Your App:** Log in, go to **Manage apps**, and click **Connect an app**.
4.  **Select App Owner:** Choose your organization.
5.  **Configure App Details:**
    -   **Credentials:** Note the **Client key** and **Client secret**.
    -   **Basic Information:** Provide an App icon (1024x1024), App name, Category, and Description.
    -   **Platforms:** Select **Web** and provide the app's URL.
6.  **Add Required Products:**
    -   Add the **Content Posting API**.
    -   Add the **Login Kit**.
7.  **Configure Product Settings:**
    -   For the Login Kit, provide a **Redirect URI** to handle the OAuth callback.
8.  **Configure Scopes:**
    -   Request and get approval for the `video.upload` scope.
9.  **Verify URL Ownership:**
    -   Verify URL properties for all configured URLs in **Production mode**.
    -   This is required for the Content Posting API upload URL.

### App Submission and Review
10. **Prepare for Submission:** In the **App review** section, explain the API and scope usage in detail.
11. **Submit for Review:** Upload a demo video showing the end-to-end flow and submit. The app status will change from `Draft` to `In review`, and finally to `Live` upon approval.

## 8. Phase 2: Detailed Webapp Implementation Plan

This section provides a detailed breakdown of the implementation, including the data flow, component responsibilities, and necessary file changes.

### 8.1. Database Schema for TikTok Accounts

First, we need a table in our Supabase database to store the linked TikTok accounts.

**`tiktok_accounts` Table Schema:**
```sql
CREATE TABLE tiktok_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- Foreign key to the Jarvis user
  tiktok_open_id VARCHAR(255) UNIQUE NOT NULL,
  tiktok_username VARCHAR(255),
  tiktok_avatar_url TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_in INTEGER NOT NULL,
  refresh_expires_in INTEGER NOT NULL,
  token_type VARCHAR(50),
  scope VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
- **Action:** This SQL statement needs to be added as a new Supabase migration.

### 8.2. TikTok Account Linking Flow (Detailed)

This flow describes how a Jarvis user links their TikTok account.

**Overall Flow:**
`Frontend (User Action)` -> `TikTok Auth Page` -> `Frontend (Callback Page)` -> `Supabase Edge Function` -> `TikTok API` -> `Supabase DB`

**Step-by-Step Breakdown:**

1.  **Initiate Linking (Frontend):**
    *   **File:** `jarvis-frontend/src/components/tiktok/TikTokAccountManager.tsx`
    *   **Action:** A user clicks the "Link New TikTok Account" button.
    *   **Logic:** The `handleLinkAccount` function will:
        *   Generate a `code_verifier` and `code_challenge` using the `pkce-challenge` library.
        *   Store the `code_verifier` in the Zustand store for later use.
        *   Construct the authorization URL for `https://www.tiktok.com/v2/auth/authorize/` with the necessary parameters (`client_key`, `scope`, `redirect_uri`, `code_challenge`, etc.).
        *   Redirect the user to this TikTok URL.

2.  **Handle OAuth Callback (Frontend):**
    *   **File:** `jarvis-frontend/src/pages/TikTokCallbackPage.tsx`
    *   **Action:** After the user authorizes the app on TikTok, they are redirected back to our app at the specified `redirect_uri`.
    *   **Logic:**
        *   The page will extract the `code` from the URL query parameters.
        *   It will retrieve the `code_verifier` from the Zustand store.
        *   It will then invoke our Supabase Edge Function, passing the `code` and `code_verifier`.

3.  **Exchange Token and Store Data (Backend):**
    *   **File:** `jarvis-frontend/supabase/functions/tiktok-auth/index.ts`
    *   **Action:** The Edge Function receives the `code` and `code_verifier` from the frontend.
    *   **Logic (Needs Update):**
        *   The function will make a POST request to the TikTok token endpoint (`https://open.tiktokapis.com/v2/oauth/token/`) to exchange the authorization code for an `access_token` and `refresh_token`.
        *   **New Logic:** After successfully getting the tokens, it will make another request to the TikTok User Info endpoint (`https://open.tiktokapis.com/v2/user/info/`) using the new access token to get the user's `open_id`, `username`, and `avatar_url`.
        *   **New Logic:** It will then use the Supabase admin client to `upsert` this information into our `tiktok_accounts` table, associating it with the currently logged-in Jarvis user. The `tiktok_open_id` will be the unique constraint for the upsert.
        *   It will return a success or error message to the frontend.

4.  **Display Linked Accounts (Frontend):**
    *   **New File:** `jarvis-frontend/src/hooks/useTikTokAccounts.ts`
        *   **Purpose:** A custom Tanstack Query hook to fetch all linked TikTok accounts for the current Jarvis user from the `tiktok_accounts` table. It will handle loading, error, and data states.
    *   **New File:** `jarvis-frontend/src/components/tiktok/TikTokAccountCard.tsx`
        *   **Purpose:** A presentational component to display a single linked TikTok account.
        *   **Content:** It will show the TikTok avatar, username, a link to their profile (`https://www.tiktok.com/@{username}`), and some placeholder stats. It will be a clickable card that can later navigate to a detail page.
    *   **New File:** `jarvis-frontend/src/components/tiktok/TikTokAccountList.tsx`
        *   **Purpose:** A component that uses the `useTikTokAccounts` hook to fetch the data.
        *   **Logic:** It will map over the returned accounts and render a `TikTokAccountCard` for each one. It will also handle the loading and error states.
    *   **File to Modify:** `jarvis-frontend/src/pages/TikTokPage.tsx`
        *   **Action:** This page will be simplified.
        *   **New Content:** It will render the `TikTokAccountManager` component (for the "Link New Account" button) and the `TikTokAccountList` component.

### 8.3. Draft Creation and Uploading (Photo Slides)

This flow remains largely the same as the initial design, but we can clarify the frontend components.

1.  **Image Hosting:** The `tiktok-proxy` service is complete and will be used to serve images from Supabase Storage via a verified domain.

2.  **Draft Creation UI:**
    *   **File:** `jarvis-frontend/src/components/tiktok/DraftCreator.tsx`
    *   **Logic:**
        *   A drag-and-drop interface for uploading images.
        *   It will upload the selected images to a Supabase Storage bucket.
        *   Upon successful upload, it will receive the public URLs for these images.
        *   It will construct the proxied URLs (e.g., `https://our-verified-domain.com/photo/image_name.jpg`).

3.  **Initiate Upload to TikTok:**
    *   **New File:** `jarvis-frontend/src/services/tiktokAPI.ts`
        *   **Purpose:** To encapsulate all API calls to TikTok.
        *   **Function:** Will contain a function like `initiatePhotoPost(accessToken, photoUrls)` that calls the TikTok Content Posting API (`/v2/post/publish/content/init/`).
    *   **Logic:**
        *   The `DraftCreator.tsx` component will call this service function, passing the access token of the selected TikTok account and the array of proxied photo URLs.
        *   It will handle the response from the API, which includes the `publish_id`.
        *   The UI will then display a message to the user instructing them to complete the post in the TikTok app.

## 9. UI/UX with Shadcn

- **Layout:** A main layout with a persistent side menu for navigation.
- **Components:** `Card`, `Table`, `Button`, `Dialog`, `Input`, `Label`, `Select`.

## 10. Routing

- `react-router-dom` will manage the application's routing.
- Routes will be defined for:
  - `/tiktok` (main TikTok functionality)
  - `/admin` (admin panel)

## 11. Implementation Steps

1.  **Project Setup:** Initialize the Vite project and install all dependencies.
2.  **UI Shell:** Create the main layout, including the side menu and header.
3.  **Supabase Clients:** Set up the `jarvisClient` and `adminClient` and their environment variables.
4.  **Routing:** Implement the basic routes for the pages.
5.  **TikTok Account Pairing:** Build the UI and backend logic for pairing accounts.
6.  **Image Hosting Proxy:** Set up the Cloud Run proxy for serving images from a verified domain.
7.  **Post Analytics:** Implement the feature to fetch and display TikTok posts and analytics.
8.  **Draft Creator:** Build the image organizer and draft upload functionality.
9.  **Admin Panel:** Stub out the admin panel page.
10. **Styling and Refinement:** Polish the UI and ensure a consistent user experience.
