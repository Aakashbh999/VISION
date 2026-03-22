-- Migration 023: Add created_by column to portal.resources
-- This column tracks which user uploaded each resource
-- Safe to run multiple times (idempotent)

BEGIN;

-- Add created_by column to resources if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal'
          AND table_name   = 'resources'
          AND column_name  = 'created_by'
    ) THEN
        ALTER TABLE portal.resources
            ADD COLUMN created_by INTEGER;

        ALTER TABLE portal.resources
            ADD CONSTRAINT resources_created_by_fkey
            FOREIGN KEY (created_by)
            REFERENCES portal.users(user_id)
            ON DELETE SET NULL;

        RAISE NOTICE 'Added created_by column to portal.resources';
    ELSE
        RAISE NOTICE 'created_by column already exists on portal.resources – skipping';
    END IF;
END $$;

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_resources_created_by
    ON portal.resources(created_by);

COMMIT;
