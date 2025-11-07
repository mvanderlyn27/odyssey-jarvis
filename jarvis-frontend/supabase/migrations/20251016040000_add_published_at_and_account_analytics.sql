ALTER TABLE posts
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE TABLE
    IF NOT EXISTS tiktok_account_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        tiktok_account_id UUID REFERENCES tiktok_accounts (id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW (),
        follower_count INTEGER,
        following_count INTEGER,
        likes_count INTEGER,
        video_count INTEGER
    );