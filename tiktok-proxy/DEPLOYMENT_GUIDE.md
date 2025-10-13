# Deployment Guide for TikTok Proxy Service

This guide provides step-by-step instructions on how to deploy the `tiktok-proxy` service to Google Cloud Run using the provided GitHub Actions workflow.

## Prerequisites

- A Google Cloud Platform (GCP) account with billing enabled.
- A GitHub repository for this project.
- `gcloud` CLI installed and authenticated locally (for initial setup).

---

### **Step 1: Google Cloud Project Setup**

This is a one-time setup for your Google Cloud environment.

1.  **Create or Select a GCP Project:**
    -   Ensure you have a Google Cloud project ready for this deployment.

2.  **Enable Required APIs:**
    -   In the GCP Console, navigate to **APIs & Services > Library** and enable the following APIs:
        -   **Cloud Run API**
        -   **Artifact Registry API**
        -   **Identity and Access Management (IAM) API**

3.  **Create an Artifact Registry Repository:**
    -   This is where your Docker images will be stored.
    -   Go to **Artifact Registry** in the Cloud Console.
    -   Click **Create Repository**.
    -   **Name:** Choose a name (e.g., `jarvis-services`).
    -   **Format:** Select **Docker**.
    -   **Region:** Choose your desired region (e.g., `us-central1`).

4.  **Create a Service Account:**
    -   This account will be used by GitHub Actions to deploy your service securely.
    -   Go to **IAM & Admin > Service Accounts**.
    -   Click **Create Service Account**.
    -   **Name:** Give it a descriptive name (e.g., `github-actions-deployer`).
    -   **Grant Access (Roles):** Assign the following roles to the service account:
        -   `Cloud Run Admin` (to manage Cloud Run services)
        -   `Storage Admin` (to push images to Artifact Registry)
        -   `Service Account User` (to allow it to be impersonated by GitHub Actions)

5.  **Set up Workload Identity Federation:**
    -   This is the modern, secure method for allowing GitHub Actions to authenticate with Google Cloud without using long-lived secret keys.
    -   Go to **IAM & Admin > Workload Identity Federation**.
    -   Click **Create Pool** and give it a name (e.g., `github-pool`).
    -   After creating the pool, click **Add Provider**.
    -   Select **OpenID Connect (OIDC)**.
    -   **Issuer URI:** `https://token.actions.githubusercontent.com`
    -   **Audience:** Use the default.
    -   **Attribute mapping:**
        -   `google.subject`: `assertion.sub`
        -   `attribute.actor`: `assertion.actor`
        -   `attribute.repository`: `assertion.repository`
    -   **Connect Service Account:** Go back to your Service Account's **Permissions** tab, click **Grant Access**, and add the Workload Identity Pool principal. Grant it the **Workload Identity User** role. The principal will look like:
        `principal://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/subject/repo:YOUR_GITHUB_ORG/YOUR_REPO:ref:refs/heads/main`

---

### **Step 2: Add Secrets to Your GitHub Repository**

Navigate to your GitHub repository's **Settings > Secrets and variables > Actions** and add the following repository secrets:

-   `GCP_PROJECT_ID`: Your Google Cloud Project ID.
-   `GCP_REGION`: The region you are deploying to (e.g., `us-central1`).
-   `GCP_ARTIFACT_REGISTRY_REPO_NAME`: The name of the Artifact Registry repository you created (e.g., `jarvis-services`).
-   `GCP_WORKLOAD_IDENTITY_PROVIDER`: The full identifier of the Workload Identity Provider. It looks like `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID`.
-   `GCP_SERVICE_ACCOUNT_EMAIL`: The email address of the service account you created.
-   `CLOUD_RUN_SERVICE_PROD`: The name you want to give your Cloud Run service (e.g., `tiktok-proxy-prod`).
-   `PROD_SUPABASE_URL`: The Supabase URL from your `.env` file.
-   `PROD_SUPABASE_BUCKET_NAME`: The Supabase bucket name from your `.env` file.

---

### **Step 3: Deploy**

Once the setup above is complete, the deployment is fully automated.

1.  **Commit and Push:** Commit all the new files (`Dockerfile`, `.github/workflows/deploy.yml`, etc.) to your `main` branch.

    ```bash
    git add .
    git commit -m "feat: Set up tiktok-proxy with Docker and CI/CD"
    git push origin main
    ```

2.  **Monitor the Workflow:**
    -   Go to the **Actions** tab in your GitHub repository.
    -   You will see the "Build and Deploy to Cloud Run" workflow running.
    -   You can click on it to see the progress of the build and deployment jobs.

Once the workflow completes successfully, your service will be live on Google Cloud Run.
