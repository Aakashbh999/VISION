-- ============================================================
-- Migration 051: Tag System Overhaul
--   1. Add tag_type column ('system' | 'custom') to portal.tags
--   2. Mark granular language-specific tags as 'custom'
--   3. Upsert the 15 authoritative system tags
--   4. Backfill portal.resource_tags from existing portal.resources.hashtags[]
--   5. Add index on tag_type for efficient filtering
--
-- Safe to run multiple times (idempotent)
-- ============================================================

BEGIN;

-- ============================================================
-- SECTION 1: Add tag_type column
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'portal' AND table_name = 'tags' AND column_name = 'tag_type'
  ) THEN
    -- Default 'system' so all existing seeded tags are initially system-type
    ALTER TABLE portal.tags
      ADD COLUMN tag_type VARCHAR(10) NOT NULL DEFAULT 'system'
        CHECK (tag_type IN ('system', 'custom'));
    RAISE NOTICE 'Added tag_type column to portal.tags';
  ELSE
    RAISE NOTICE 'tag_type already exists — skipping';
  END IF;
END $$;

-- ============================================================
-- SECTION 2: Demote granular language-specific tags to 'custom'
-- (They were seeded but are too granular to be authoritative system tags)
-- ============================================================

UPDATE portal.tags
SET tag_type = 'custom'
WHERE slug IN ('react', 'python', 'javascript', 'java', 'php', 'cpp', 'nodejs');

-- ============================================================
-- SECTION 3: Upsert the 15 authoritative system tags
-- ============================================================

INSERT INTO portal.tags (name, slug, tag_type) VALUES
  ('Web Development',   'web-development',   'system'),
  ('Mobile Development','mobile-development','system'),
  ('Machine Learning',  'machine-learning',  'system'),
  ('Data Science',      'data-science',      'system'),
  ('Database',          'database',          'system'),
  ('Security',          'security',          'system'),
  ('DevOps',            'devops',            'system'),
  ('Cloud Computing',   'cloud-computing',   'system'),
  ('Algorithms',        'algorithms',        'system'),
  ('Project Help',      'project-help',      'system'),
  ('Career Advice',     'career-advice',     'system'),
  ('Interview Prep',    'interview-prep',    'system'),
  ('Study Tips',        'study-tips',        'system'),
  ('Internship',        'internship',        'system'),
  ('Open Source',       'open-source',       'system')
ON CONFLICT (slug) DO UPDATE SET
  tag_type = EXCLUDED.tag_type,
  name     = EXCLUDED.name;

-- ============================================================
-- SECTION 4: (Skipped) Backfill from hashtags[] column
-- portal.resources has no hashtags column on this deployment.
-- Future resource tags are written via portal.resource_tags directly.
-- ============================================================

-- No-op: backfill not applicable.

-- ============================================================
-- SECTION 5: Index on tag_type
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_tags_type ON portal.tags(tag_type);

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 051 (Tag System Overhaul) completed successfully.';
END $$;

COMMIT;
