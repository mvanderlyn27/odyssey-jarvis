ALTER TABLE subscriptions
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN trial_starts_at TIMESTAMPTZ,
ADD COLUMN trial_ends_at TIMESTAMPTZ,
ADD COLUMN current_period_ends_at TIMESTAMPTZ;