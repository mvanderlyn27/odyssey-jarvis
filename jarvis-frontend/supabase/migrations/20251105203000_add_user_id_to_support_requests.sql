ALTER TABLE support_requests
ADD COLUMN user_id UUID REFERENCES auth.users (id);

CREATE POLICY "Allow users to view their own support requests" ON support_requests FOR
SELECT
    USING (auth.uid () = user_id);

ALTER POLICY "Allow authenticated users to create support requests" ON support_requests
WITH
    CHECK (auth.uid () = user_id);