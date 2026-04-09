-- ============================================================
-- Migration 052: Audit Fixes
-- Fixes identified by full codebase audit (2026-04-09)
-- ============================================================

-- ============================================================
-- FIX 1: Add UNIQUE constraint to portal.resource_tags
-- The ON CONFLICT DO NOTHING in resourceController was a no-op
-- without this constraint. Duplicates are removed first.
-- ============================================================

-- Delete existing duplicate rows using ctid (resource_tags has no id PK column)
DELETE FROM portal.resource_tags
WHERE ctid NOT IN (
  SELECT MIN(ctid)
  FROM portal.resource_tags
  GROUP BY resource_id, tag_id
);

-- Add the unique constraint
ALTER TABLE portal.resource_tags
  ADD CONSTRAINT uq_resource_tag UNIQUE (resource_id, tag_id);

-- ============================================================
-- FIX 2: Remove duplicate unique constraint on portal.tags
-- tags_name_unique and tags_tag_name_key are both on `name`.
-- We keep tags_name_unique (the newer, correctly named one).
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'portal'
      AND table_name   = 'tags'
      AND constraint_name = 'tags_tag_name_key'
  ) THEN
    ALTER TABLE portal.tags DROP CONSTRAINT tags_tag_name_key;
    RAISE NOTICE 'Dropped constraint tags_tag_name_key';
  ELSE
    RAISE NOTICE 'Constraint tags_tag_name_key does not exist, skipping';
  END IF;
END $$;

-- ============================================================
-- FIX 3: Add compound index on portal.notifications
-- Speeds up the per-user notification fetch + ORDER BY created_at
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON portal.notifications(user_id, created_at DESC);

-- ============================================================
-- FIX 4: Ensure portal.users.status default is consistent
-- Set any NULL status values to 'active' so our queries work
-- (status column exists but may be un-set for older users)
-- ============================================================

UPDATE portal.users
SET status = 'active'
WHERE status IS NULL;

-- Ensure future rows default to 'active'
ALTER TABLE portal.users
  ALTER COLUMN status SET DEFAULT 'active';

-- ============================================================
-- VERIFICATION
-- ============================================================
DO $$
DECLARE
  v_dup_count integer;
BEGIN
  SELECT COUNT(*) INTO v_dup_count
  FROM (
    SELECT resource_id, tag_id, COUNT(*) c
    FROM portal.resource_tags
    GROUP BY resource_id, tag_id
    HAVING COUNT(*) > 1
  ) t;

  IF v_dup_count = 0 THEN
    RAISE NOTICE '✅ resource_tags: no duplicates, UNIQUE constraint active';
  ELSE
    RAISE WARNING '❌ resource_tags still has % duplicate pairs', v_dup_count;
  END IF;
END $$;
