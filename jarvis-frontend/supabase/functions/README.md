# Supabase Edge Functions

This directory contains the Edge Functions for the Jarvis project.

## Authentication Strategy

All Edge Functions in this project are secured using a dual-authentication strategy that supports both client-side and server-to-server communication. This is implemented in the `_shared/auth.ts` module.

When a request is received, the function will first check for a valid Supabase JWT. If a valid JWT is present, the request is approved. This is the standard method for authenticating requests from a client application.

If a JWT is not present or is invalid, the function will then check for a secret key in the `X-Internal-Secret` header. This key is used to authenticate requests from other trusted server-side environments, such as another Edge Function or a cron job.

The `tiktok-webhook` function is the only exception. It is publicly accessible to receive webhooks from TikTok, and it performs its own signature verification to ensure the request is legitimate.

## Deployment

All functions (except `tiktok-webhook`) should be deployed with the `--no-verify-jwt` flag, as the JWT verification is handled manually within each function.

```bash
supabase functions deploy your-function-name --no-verify-jwt
```

## Environment Variables

To enable the internal authentication mechanism, you must set the `INTERNAL_SECRET_KEY` environment variable. This can be done by creating a `.env` file in this directory for local development, or by setting it directly in your Supabase project's settings for production.

**Example `.env` file:**

```
INTERNAL_SECRET_KEY="your-super-secret-key"
```
