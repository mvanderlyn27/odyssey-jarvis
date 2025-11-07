-- This migration corrects the data type of the plan_id in the subscriptions table
-- and establishes a foreign key relationship to the plans table.

-- First, alter the plan_id column to be of type UUID.
-- This is necessary because it was previously a TEXT type storing the Stripe price_id.
ALTER TABLE public.subscriptions
ALTER COLUMN plan_id TYPE UUID USING plan_id::uuid;

-- Add the foreign key constraint to ensure data integrity.
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_plan_id_fkey
FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE;
