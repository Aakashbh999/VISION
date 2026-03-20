-- Migration 025: Add original_filename column to resources table
-- Stores the original filename uploaded by user for display purposes
-- Safe to run multiple times (idempotent)

BEGIN;

-- Add original_filename column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal'
          AND table_name   = 'resources'
          AND column_name  = 'original_filename'
    ) THEN
        ALTER TABLE portal.resources
            ADD COLUMN original_filename TEXT;
        RAISE NOTICE 'Added original_filename column to portal.resources';
    ELSE
        RAISE NOTICE 'original_filename column already exists on portal.resources – skipping';
    END IF;
END $$;

COMMIT;
