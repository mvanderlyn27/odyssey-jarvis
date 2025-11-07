DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='post_assets' AND column_name='thumbnail_url'
    ) THEN
        ALTER TABLE "public"."post_assets"
        RENAME COLUMN "thumbnail_url" TO "thumbnail_path";
    END IF;
END$$;
