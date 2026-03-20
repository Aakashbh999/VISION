-- Migration 037: Add User Social Links
-- Adds columns to portal.users for social media links

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'linkedin_url') THEN
        ALTER TABLE portal.users ADD COLUMN linkedin_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'facebook_url') THEN
        ALTER TABLE portal.users ADD COLUMN facebook_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'instagram_url') THEN
        ALTER TABLE portal.users ADD COLUMN instagram_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'youtube_url') THEN
        ALTER TABLE portal.users ADD COLUMN youtube_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'reddit_url') THEN
        ALTER TABLE portal.users ADD COLUMN reddit_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'twitter_url') THEN
        ALTER TABLE portal.users ADD COLUMN twitter_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'github_url') THEN
        ALTER TABLE portal.users ADD COLUMN github_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'website_url') THEN
        ALTER TABLE portal.users ADD COLUMN website_url TEXT;
    END IF;
END $$;

COMMIT;
