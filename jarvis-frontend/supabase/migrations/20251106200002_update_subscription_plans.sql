-- First, delete the old plans to ensure a clean slate.
DELETE FROM plans;

-- Then, insert the new, restructured plans.
INSERT INTO
    plans (
        name,
        description,
        price,
        stripe_price_id,
        stripe_product_id,
        features
    )
VALUES
    (
        'Free',
        'For individuals just getting started.',
        0.00,
        '',
        '',
        '{
            "max_accounts": 1,
            "max_posts_per_day": 3,
            "analytics_granularity": null,
            "video_uploads": false,
            "unlimited_drafts": false,
            "draft_limit": 10,
            "unlimited_posts": false,
            "unlimited_post_history": false
        }'
    ),
    (
        'Indie',
        'For creators and small businesses.',
        5.00,
        'price_1SPSBHEO0Y2ubURm4SYbYgM6',
        'prod_TMAWvG9KacJw8R',
        '{
            "max_accounts": 10,
            "max_posts_per_day": -1,
            "analytics_granularity": "daily",
            "video_uploads": true,
            "unlimited_drafts": false,
            "draft_limit": 100,
            "unlimited_posts": false,
            "unlimited_post_history": false
        }'
    ),
    (
        'Pro',
        'For agencies and power users.',
        30.00,
        'price_1SQczTEO0Y2ubURmMh8LHNEN',
        'prod_TMAYQmZEPWbjRB',
        '{
            "max_accounts": -1,
            "max_posts_per_day": -1,
            "analytics_granularity": "hourly",
            "video_uploads": true,
            "unlimited_drafts": true,
            "draft_limit": -1,
            "unlimited_posts": true,
            "unlimited_post_history": true
        }'
    );