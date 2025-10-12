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

## 8. Phase 2: Webapp Implementation

### 8.1. User Authentication and TikTok Account Linking

- **Primary Authentication:** Users will log in to the Jarvis tool using a standard email/password method. This will be managed by the `jarvisClient` and Supabase Authentication.
- **Linking TikTok Accounts:** Once logged into Jarvis, a user can link one or more TikTok accounts to post drafts to. This process uses the TikTok Login Kit:
    1.  The user initiates the linking process from the Jarvis UI.
    2.  This triggers the TikTok OAuth flow, prompting the user to authorize the application with the necessary `video.upload` scope for their TikTok account.
    3.  A backend service (Supabase Edge Function) will handle the OAuth callback, exchange the authorization code for an access token using the Client Secret, and securely store the token associated with that specific TikTok account in our main Supabase database.
    4.  The frontend will display the list of linked TikTok accounts that the Jarvis user can now post drafts to.
- **Future Improvement:** OAuth tokens will initially be stored in the main Supabase database. A later improvement will be to create a dedicated internal tools database to centralize credentials for multiple tools.

### 8.2. Post Analytics

- A component will fetch and display all posts from the selected, paired TikTok account.
- Data will be fetched from the TikTok API using the stored access tokens.
- Analytics (likes, comments, shares, views) will be displayed in a table or grid format.

### 8.3. Draft Creation and Uploading (Photo Slides)

- **Image Organizer:**
    - A drag-and-drop interface will allow users to upload and reorder images.
    - Images will be validated against TikTok's requirements.
- **Media Requirements:**
    - **Formats:** WebP, JPEG
    - **Dimensions:** Maximum 1080p
    - **File Size:** Maximum 20MB per image
- **Image Hosting via Verified Domain Proxy:** To meet TikTok's requirement that photo URLs are served from a verified domain, we will implement a lightweight proxy.
    -   **Technology:** Google Cloud Run. This is a cost-effective and scalable solution.
    -   **Purpose:**
        -   Expose a public endpoint on our verified domain (e.g., `https://our-verified-domain.com/photo/:image_name`).
        -   When this endpoint is hit, the proxy will fetch the actual image file from our Supabase Storage bucket.
        -   The proxy will then stream the image back in the response to the requester (TikTok's servers).
        -   `Cache-Control` headers can be used to optimize performance.
    -   **Implementation:** This will involve creating a small service (e.g., with Node.js/Express or Go), containerizing it with Docker, and deploying it to Cloud Run. The deployment process can be automated with a GitHub Action.

- **Draft Upload (Content Posting API):**
    1.  **Prepare Photo URLs:** Uploaded images must be hosted on a URL that was verified during the app setup phase. This will be achieved using the proxy described above.
    2.  **Initiate Upload:** Invoke the Content Posting API photo endpoint (`/v2/post/publish/content/init/`) with the access token, `post_mode` set to `MEDIA_UPLOAD`, `media_type` set to `PHOTO`, and an array of the hosted photo URLs.
    3.  **Handle Response:** A successful call returns a `publish_id`.
    4.  **User Finalization:** The UI must inform the user that they need to open the TikTok app, check their inbox notifications, and complete the post from there.

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
