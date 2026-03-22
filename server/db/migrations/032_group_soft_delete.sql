-- Migration 032: Soft Delete for Groups
-- Adds soft-delete support to study_groups table for user-initiated deletions
-- Admins can perform hard deletes

BEGIN;

-- Add soft-delete columns to portal.study_groups
DO $$
BEGIN
    -- deleted_at: timestamp when group was deleted (NULL = active)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'deleted_at') THEN
        ALTER TABLE portal.study_groups ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added deleted_at to portal.study_groups';
    END IF;

    -- deleted_by: user_id who deleted it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'deleted_by') THEN
        ALTER TABLE portal.study_groups ADD COLUMN deleted_by INTEGER REFERENCES portal.users(user_id) ON DELETE SET NULL;
        RAISE NOTICE 'Added deleted_by to portal.study_groups';
    END IF;

    -- deletion_reason: user's stated reason for deletion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'deletion_reason') THEN
        ALTER TABLE portal.study_groups ADD COLUMN deletion_reason TEXT;
        RAISE NOTICE 'Added deletion_reason to portal.study_groups';
    END IF;

    -- is_hard_deleted: reserved for admin hard-deletes (cascading delete of all records)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'is_hard_deleted') THEN
        ALTER TABLE portal.study_groups ADD COLUMN is_hard_deleted BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_hard_deleted to portal.study_groups';
    END IF;
END $$;

-- Create indexes for performance on soft-delete queries
CREATE INDEX IF NOT EXISTS idx_study_groups_deleted_at ON portal.study_groups(deleted_at);
CREATE INDEX IF NOT EXISTS idx_study_groups_active ON portal.study_groups(deleted_at NULLS FIRST);

COMMIT;

DO $$ BEGIN RAISE NOTICE 'Migration 032 completed: soft-delete for groups'; END $$;
