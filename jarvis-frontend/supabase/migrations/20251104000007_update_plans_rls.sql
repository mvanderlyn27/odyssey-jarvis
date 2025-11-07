DROP POLICY "Authenticated users can view plans" ON public.plans;

CREATE POLICY "Public can view plans" ON public.plans FOR
SELECT
    TO anon,
    authenticated USING (true);