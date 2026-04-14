-- Migration 056: Add file metadata columns for group resource vault posts

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'portal'
      AND table_name = 'group_posts'
      AND column_name = 'file_url'
  ) THEN
    ALTER TABLE portal.group_posts ADD COLUMN file_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'portal'
      AND table_name = 'group_posts'
      AND column_name = 'file_public_id'
  ) THEN
    ALTER TABLE portal.group_posts ADD COLUMN file_public_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'portal'
      AND table_name = 'group_posts'
      AND column_name = 'file_type'
  ) THEN
    ALTER TABLE portal.group_posts ADD COLUMN file_type TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'portal'
      AND table_name = 'group_posts'
      AND column_name = 'file_name'
  ) THEN
    ALTER TABLE portal.group_posts ADD COLUMN file_name TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_group_posts_file_url
  ON portal.group_posts (file_url)
  WHERE file_url IS NOT NULL;
