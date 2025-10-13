-- Create the draft_assets table
CREATE TABLE
    draft_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        draft_id bigint REFERENCES drafts (id) ON DELETE CASCADE NOT NULL,
        asset_url TEXT NOT NULL,
        asset_type TEXT NOT NULL, -- 'image' or 'video'
        "order" INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW ()
    );

ALTER TABLE draft_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage draft assets" ON draft_assets FOR ALL USING (auth.role () = 'authenticated');

-- Drop existing RLS policies for drafts
DROP POLICY "Users can view their own drafts" ON drafts;

DROP POLICY "Users can create drafts" ON drafts;

DROP POLICY "Users can update their own drafts" ON drafts;

-- Drop existing RLS policies for published_posts
DROP POLICY "Users can view their own published posts" ON published_posts;

DROP POLICY "Users can create published posts for their own drafts" ON published_posts;

-- Create new RLS policies for drafts
CREATE POLICY "Allow authenticated users to manage drafts" ON drafts FOR ALL USING (auth.role () = 'authenticated');

-- Create new RLS policies for published_posts
CREATE POLICY "Allow authenticated users to manage published posts" ON published_posts FOR ALL USING (auth.role () = 'authenticated');

-- Remove the media_files column from drafts
ALTER TABLE drafts
DROP COLUMN media_files;