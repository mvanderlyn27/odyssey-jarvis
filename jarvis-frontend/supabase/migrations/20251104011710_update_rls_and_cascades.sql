-- Add RLS to tiktok_account_analytics
ALTER TABLE public.tiktok_account_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tiktok_account_analytics" ON public.tiktok_account_analytics FOR
SELECT
    USING (
        EXISTS (
            SELECT
                1
            FROM
                public.tiktok_accounts ta
            WHERE
                ta.id = tiktok_account_analytics.tiktok_account_id
                AND (
                    ta.user_id = auth.uid ()
                    OR ta.organization_id = get_my_organization_id ()
                )
        )
    );

-- Update profiles table to cascade delete
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE;