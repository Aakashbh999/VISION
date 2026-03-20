-- Migration 033: Soft Delete for Posts
-- Adds soft-delete support to group_posts table for user-initiated deletions

BEGIN;

DO $$
BEGIN
    -- deleted_at: timestamp when post was deleted (NULL = active)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'group_posts' AND column_name = 'deleted_at') THEN
        ALTER TABLE portal.group_posts ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added deleted_at to portal.group_posts';
    END IF;

    -- deleted_by: user_id who deleted it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'group_posts' AND column_name = 'deleted_by') THEN
        ALTER TABLE portal.group_posts ADD COLUMN deleted_by INTEGER REFERENCES portal.users(user_id) ON DELETE SET NULL;
        RAISE NOTICE 'Added deleted_by to portal.group_posts';
    END IF;

    -- deletion_reason: user's stated reason for deletion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'group_posts' AND column_name = 'deletion_reason') THEN
        ALTER TABLE portal.group_posts ADD COLUMN deletion_reason TEXT;
        RAISE NOTICE 'Added deletion_reason to portal.group_posts';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_posts_deleted_at ON portal.group_posts(deleted_at);
CREATE INDEX IF NOT EXISTS idx_group_posts_active ON portal.group_posts(deleted_at NULLS FIRST);

COMMIT;

DO $$ BEGIN RAISE NOTICE 'Migration 033 completed: soft-delete for posts'; END $$;
