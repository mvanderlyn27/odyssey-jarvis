-- 1. Enable Row Level Security on the table
ALTER TABLE public.tiktok_accounts ENABLE ROW LEVEL SECURITY;

-- 2. Create a policy to allow users to view their own linked accounts
CREATE POLICY "Allow individual user access to their own accounts" ON public.tiktok_accounts FOR
SELECT
    USING (auth.uid () = user_id);

-- 3. Create a policy to allow users to insert new linked accounts for themselves
CREATE POLICY "Allow individual user to insert their own accounts" ON public.tiktok_accounts FOR INSERT
WITH
    CHECK (auth.uid () = user_id);