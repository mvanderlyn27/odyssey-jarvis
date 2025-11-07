ALTER TABLE subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_id_fkey,
ALTER COLUMN plan_id
SET
    DATA TYPE TEXT;