-- Migration 034: Soft Delete for Comments
-- Adds soft-delete support to discussion_comments table for user-initiated deletions

BEGIN;

DO $$
BEGIN
    -- deleted_at: timestamp when comment was deleted (NULL = active)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'discussion_comments' AND column_name = 'deleted_at') THEN
        ALTER TABLE portal.discussion_comments ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added deleted_at to portal.discussion_comments';
    END IF;

    -- deleted_by: user_id who deleted it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'discussion_comments' AND column_name = 'deleted_by') THEN
        ALTER TABLE portal.discussion_comments ADD COLUMN deleted_by INTEGER REFERENCES portal.users(user_id) ON DELETE SET NULL;
        RAISE NOTICE 'Added deleted_by to portal.discussion_comments';
    END IF;

    -- deletion_reason: user's stated reason for deletion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'discussion_comments' AND column_name = 'deletion_reason') THEN
        ALTER TABLE portal.discussion_comments ADD COLUMN deletion_reason TEXT;
        RAISE NOTICE 'Added deletion_reason to portal.discussion_comments';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discussion_comments_deleted_at ON portal.discussion_comments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_active ON portal.discussion_comments(deleted_at NULLS FIRST);

COMMIT;

DO $$ BEGIN RAISE NOTICE 'Migration 034 completed: soft-delete for comments'; END $$;
