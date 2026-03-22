-- Migration 030: Profile Management System
-- Adds user profile fields (bio, images, cooldowns) and follower system

BEGIN;

-- ============================================================
-- SECTION 1: User profile fields on portal.users
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE portal.users ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio to portal.users';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'profile_image') THEN
        ALTER TABLE portal.users ADD COLUMN profile_image TEXT;
        RAISE NOTICE 'Added profile_image to portal.users';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'profile_image_public_id') THEN
        ALTER TABLE portal.users ADD COLUMN profile_image_public_id TEXT;
        RAISE NOTICE 'Added profile_image_public_id to portal.users';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'banner_image') THEN
        ALTER TABLE portal.users ADD COLUMN banner_image TEXT;
        RAISE NOTICE 'Added banner_image to portal.users';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'banner_image_public_id') THEN
        ALTER TABLE portal.users ADD COLUMN banner_image_public_id TEXT;
        RAISE NOTICE 'Added banner_image_public_id to portal.users';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'last_profile_pic_update') THEN
        ALTER TABLE portal.users ADD COLUMN last_profile_pic_update TIMESTAMPTZ;
        RAISE NOTICE 'Added last_profile_pic_update to portal.users';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'last_banner_update') THEN
        ALTER TABLE portal.users ADD COLUMN last_banner_update TIMESTAMPTZ;
        RAISE NOTICE 'Added last_banner_update to portal.users';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'profile_pic_free_skips') THEN
        ALTER TABLE portal.users ADD COLUMN profile_pic_free_skips INTEGER NOT NULL DEFAULT 3;
        RAISE NOTICE 'Added profile_pic_free_skips to portal.users';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'banner_free_skips') THEN
        ALTER TABLE portal.users ADD COLUMN banner_free_skips INTEGER NOT NULL DEFAULT 3;
        RAISE NOTICE 'Added banner_free_skips to portal.users';
    END IF;
END $$;

-- ============================================================
-- SECTION 2: Follower System
-- ============================================================
CREATE TABLE IF NOT EXISTS portal.user_followers (
    follower_id  INTEGER NOT NULL REFERENCES portal.users(user_id) ON DELETE CASCADE,
    following_id INTEGER NOT NULL REFERENCES portal.users(user_id) ON DELETE CASCADE,
    followed_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_user_followers_follower  ON portal.user_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_followers_following ON portal.user_followers(following_id);

COMMENT ON TABLE portal.user_followers IS 'Social follow graph between VISION users.';

COMMIT;

DO $$ BEGIN RAISE NOTICE '✅ Migration 030: Profile Management completed.'; END $$;
