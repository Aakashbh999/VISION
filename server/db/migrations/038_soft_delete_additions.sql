-- Migration 038: Soft Delete Additions for IT Clubs

BEGIN;

DO $$
BEGIN
    -- deleted_at: timestamp when club was deleted (archive)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'it_clubs' AND column_name = 'deleted_at') THEN
        ALTER TABLE portal.it_clubs ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added deleted_at to portal.it_clubs';
    END IF;

    -- deleted_by: user_id who deleted it (admin/archiver)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'it_clubs' AND column_name = 'deleted_by') THEN
        ALTER TABLE portal.it_clubs ADD COLUMN deleted_by INTEGER REFERENCES portal.users(user_id) ON DELETE SET NULL;
        RAISE NOTICE 'Added deleted_by to portal.it_clubs';
    END IF;

    -- deletion_reason: why it was removed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'it_clubs' AND column_name = 'deletion_reason') THEN
        ALTER TABLE portal.it_clubs ADD COLUMN deletion_reason TEXT;
        RAISE NOTICE 'Added deletion_reason to portal.it_clubs';
    END IF;
END $$;

-- Add indexes to optimize filtering out deleted (archived) content
CREATE INDEX IF NOT EXISTS idx_it_clubs_deleted_at ON portal.it_clubs(deleted_at);
CREATE INDEX IF NOT EXISTS idx_it_clubs_active ON portal.it_clubs(deleted_at NULLS FIRST);

COMMIT;
