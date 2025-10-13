CREATE TABLE
    tiktok_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        user_id UUID REFERENCES auth.users (id) NOT NULL, -- Foreign key to the Jarvis user
        tiktok_open_id VARCHAR(255) UNIQUE NOT NULL,
        tiktok_username VARCHAR(255),
        tiktok_avatar_url TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_in INTEGER NOT NULL,
        refresh_expires_in INTEGER NOT NULL,
        token_type VARCHAR(50),
        scope VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW (),
        updated_at TIMESTAMPTZ DEFAULT NOW ()
    );