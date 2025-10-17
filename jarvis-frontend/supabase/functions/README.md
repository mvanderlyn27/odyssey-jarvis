# Supabase Edge Functions

This directory contains the Edge Functions for the Jarvis project.

## JWT Verification Status

For security, JWT verification is enabled by default on all Edge Functions. However, some functions that are invoked from trusted server-side environments (like `pg_cron` or webhooks from trusted sources) may have JWT verification disabled.

| Function Name                  | JWT Verification | Notes                                                                              |
| ------------------------------ | ---------------- | ---------------------------------------------------------------------------------- |
| `publish-scheduled-posts`      | **Disabled**     | Invoked by `pg_cron`. Authenticated via `apiKey` header with `service_role_key`.   |
| `tiktok-bulk-video-details`    | **Disabled**     | Invoked by `pg_cron`. Authenticated via `apiKey` header with `service_role_key`.   |
| `tiktok-webhook`               | **Disabled**     | Invoked by TikTok's webhook service. Verification is handled within the function.  |
| ... (other functions)          | Enabled          |                                                                                    |

To deploy a function with JWT verification disabled, use the `--no-verify-jwt` flag with the Supabase CLI:

```bash
supabase functions deploy your-function-name --no-verify-jwt
