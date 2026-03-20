-- Migration 024: Add Cloudinary file columns to resources table
-- Adds file_url and file_public_id for uploaded files via Cloudinary
-- Safe to run multiple times (idempotent)

BEGIN;

-- Add file_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal'
          AND table_name   = 'resources'
          AND column_name  = 'file_url'
    ) THEN
        ALTER TABLE portal.resources
            ADD COLUMN file_url TEXT;
        RAISE NOTICE 'Added file_url column to portal.resources';
    ELSE
        RAISE NOTICE 'file_url column already exists on portal.resources – skipping';
    END IF;
END $$;

-- Add file_public_id column if it doesn't exist (for Cloudinary deletion)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal'
          AND table_name   = 'resources'
          AND column_name  = 'file_public_id'
    ) THEN
        ALTER TABLE portal.resources
            ADD COLUMN file_public_id TEXT;
        RAISE NOTICE 'Added file_public_id column to portal.resources';
    ELSE
        RAISE NOTICE 'file_public_id column already exists on portal.resources – skipping';
    END IF;
END $$;

-- Create index for faster lookups by file_public_id (useful for cleanup)
CREATE INDEX IF NOT EXISTS idx_resources_file_public_id
    ON portal.resources(file_public_id)
    WHERE file_public_id IS NOT NULL;

COMMIT;
