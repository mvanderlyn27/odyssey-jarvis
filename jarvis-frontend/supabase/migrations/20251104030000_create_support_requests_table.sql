CREATE TABLE
    support_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        name TEXT,
        email TEXT,
        message TEXT,
        status TEXT DEFAULT 'new'
    );

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to create support requests" ON support_requests FOR INSERT TO authenticated
WITH
    CHECK (auth.uid () IS NOT NULL);

CREATE POLICY "Allow admins to manage support requests" ON support_requests FOR ALL TO service_role USING (true);