-- Migration 035: Soft Delete for Resources
-- Adds soft-delete support to resources table for user-initiated deletions

BEGIN;

DO $$
BEGIN
    -- deleted_at: timestamp when resource was deleted (NULL = active)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'resources' AND column_name = 'deleted_at') THEN
        ALTER TABLE portal.resources ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added deleted_at to portal.resources';
    END IF;

    -- deleted_by: user_id who deleted it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'resources' AND column_name = 'deleted_by') THEN
        ALTER TABLE portal.resources ADD COLUMN deleted_by INTEGER REFERENCES portal.users(user_id) ON DELETE SET NULL;
        RAISE NOTICE 'Added deleted_by to portal.resources';
    END IF;

    -- deletion_reason: user's stated reason for deletion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_schema = 'portal' AND table_name = 'resources' AND column_name = 'deletion_reason') THEN
        ALTER TABLE portal.resources ADD COLUMN deletion_reason TEXT;
        RAISE NOTICE 'Added deletion_reason to portal.resources';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_deleted_at ON portal.resources(deleted_at);
CREATE INDEX IF NOT EXISTS idx_resources_active ON portal.resources(deleted_at NULLS FIRST);

COMMIT;

DO $$ BEGIN RAISE NOTICE 'Migration 035 completed: soft-delete for resources'; END $$;
