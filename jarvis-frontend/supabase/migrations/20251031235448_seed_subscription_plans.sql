-- Phase 2: Core SaaS Architecture & Feature Management
-- Step 2: Seed Subscription Plans with Feature Definitions
INSERT INTO
    plans (name, description, price, features)
VALUES
    (
        'Free',
        'For individuals just getting started.',
        0.00,
        '{
        "analytics_granularity": "daily",
        "max_accounts": 1,
        "video_uploads": false,
        "data_retention_days": 30
    }'
    ),
    (
        'Indie',
        'For creators and small businesses.',
        29.00,
        '{
        "analytics_granularity": "daily",
        "max_accounts": 5,
        "video_uploads": true,
        "data_retention_days": 365
    }'
    ),
    (
        'Pro',
        'For agencies and power users.',
        99.00,
        '{
        "analytics_granularity": "hourly",
        "max_accounts": 20,
        "video_uploads": true,
        "data_retention_days": -1
    }'
    );