-- Migration 031: Group Advanced Schema
-- Adds privacy_type, capacity, invite_token, cooldowns to study_groups
-- Adds role column to group_members
-- Creates join_requests table

BEGIN;

-- ============================================================
-- SECTION 1: Enhance portal.study_groups
-- ============================================================
DO $$
BEGIN
    -- privacy_type: 'public' | 'request' | 'private'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'privacy_type') THEN
        ALTER TABLE portal.study_groups ADD COLUMN privacy_type VARCHAR(20) NOT NULL DEFAULT 'public';
        RAISE NOTICE 'Added privacy_type to portal.study_groups';
    END IF;

    -- capacity: default 15, max 25
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'capacity') THEN
        ALTER TABLE portal.study_groups ADD COLUMN capacity INTEGER NOT NULL DEFAULT 15;
        RAISE NOTICE 'Added capacity to portal.study_groups';
    END IF;

    -- invite_token: UUID for private groups
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'invite_token') THEN
        ALTER TABLE portal.study_groups ADD COLUMN invite_token UUID DEFAULT gen_random_uuid();
        RAISE NOTICE 'Added invite_token to portal.study_groups';
    END IF;

    -- Cooldown tracking for group images
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'last_profile_pic_update') THEN
        ALTER TABLE portal.study_groups ADD COLUMN last_profile_pic_update TIMESTAMPTZ;
        RAISE NOTICE 'Added last_profile_pic_update to portal.study_groups';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'last_banner_update') THEN
        ALTER TABLE portal.study_groups ADD COLUMN last_banner_update TIMESTAMPTZ;
        RAISE NOTICE 'Added last_banner_update to portal.study_groups';
    END IF;

    -- Free skips for bypassing cooldowns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'free_skips_remaining') THEN
        ALTER TABLE portal.study_groups ADD COLUMN free_skips_remaining INTEGER NOT NULL DEFAULT 3;
        RAISE NOTICE 'Added free_skips_remaining to portal.study_groups';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_study_groups_privacy ON portal.study_groups(privacy_type);

-- ============================================================
-- SECTION 2: Role column in portal.group_members
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'group_members' AND column_name = 'role') THEN
        ALTER TABLE portal.group_members ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'member';
        RAISE NOTICE 'Added role to portal.group_members';
    END IF;
END $$;

-- Set creators to 'owner' role
UPDATE portal.group_members gm
SET role = 'owner'
FROM portal.study_groups sg
WHERE gm.group_id = sg.group_id
  AND gm.user_id = sg.created_by
  AND gm.role = 'member';

-- Add check constraint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints
                   WHERE table_schema = 'portal' AND table_name = 'group_members'
                   AND constraint_name = 'group_members_role_check') THEN
        ALTER TABLE portal.group_members
        ADD CONSTRAINT group_members_role_check
        CHECK (role IN ('owner', 'co_admin', 'member'));
        RAISE NOTICE 'Added role check constraint to portal.group_members';
    END IF;
END $$;

-- ============================================================
-- SECTION 3: Join Requests table
-- ============================================================
CREATE TABLE IF NOT EXISTS portal.join_requests (
    request_id  SERIAL PRIMARY KEY,
    group_id    INTEGER NOT NULL REFERENCES portal.study_groups(group_id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES portal.users(user_id) ON DELETE CASCADE,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending | approved | declined
    requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id),
    CONSTRAINT join_requests_status_check CHECK (status IN ('pending', 'approved', 'declined'))
);

CREATE INDEX IF NOT EXISTS idx_join_requests_group  ON portal.join_requests(group_id, status);
CREATE INDEX IF NOT EXISTS idx_join_requests_user   ON portal.join_requests(user_id);

COMMENT ON TABLE portal.join_requests IS 'Tracks pending join requests for request-to-join and private groups.';

COMMIT;

DO $$ BEGIN RAISE NOTICE '✅ Migration 031: Group Advanced Schema completed.'; END $$;
