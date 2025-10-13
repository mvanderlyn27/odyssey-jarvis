-- Create a new enum type for draft status
create type draft_status as enum ('draft', 'published', 'failed');

-- Create the drafts table
create table
    drafts (
        id bigserial primary key,
        user_id uuid references auth.users not null,
        media_files jsonb not null,
        status draft_status not null default 'draft',
        created_at timestamptz default now () not null,
        updated_at timestamptz default now () not null
    );

-- Create the published_posts table
create table
    published_posts (
        id bigserial primary key,
        draft_id bigint references drafts not null,
        tiktok_account_id uuid references tiktok_accounts not null,
        tiktok_publish_id text,
        published_at timestamptz default now () not null,
        unique (draft_id, tiktok_account_id)
    );

-- Add RLS to the drafts table
alter table drafts enable row level security;

create policy "Users can view their own drafts" on drafts for
select
    using (auth.uid () = user_id);

create policy "Users can create drafts" on drafts for insert
with
    check (auth.uid () = user_id);

create policy "Users can update their own drafts" on drafts for
update using (auth.uid () = user_id);

-- Add RLS to the published_posts table
alter table published_posts enable row level security;

create policy "Users can view their own published posts" on published_posts for
select
    using (
        exists (
            select
                1
            from
                drafts
            where
                drafts.id = published_posts.draft_id
                and drafts.user_id = auth.uid ()
        )
    );

create policy "Users can create published posts for their own drafts" on published_posts for insert
with
    check (
        exists (
            select
                1
            from
                drafts
            where
                drafts.id = published_posts.draft_id
                and drafts.user_id = auth.uid ()
        )
    );