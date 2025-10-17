CREATE INDEX IF NOT EXISTS "account_analytics_tiktok_account_id_created_at_idx" ON "public"."account_analytics" ("tiktok_account_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "post_analytics_post_id_created_at_idx" ON "public"."post_analytics" ("post_id", "created_at" DESC);