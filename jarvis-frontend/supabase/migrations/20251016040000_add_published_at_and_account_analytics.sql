ALTER TABLE posts
ADD COLUMN published_at TIMESTAMPTZ;

CREATE TABLE
    tiktok_account_analytics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        tiktok_account_id UUID REFERENCES tiktok_accounts (id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW (),
        follower_count INTEGER,
        following_count INTEGER,
        likes_count INTEGER,
        video_count INTEGER
    );