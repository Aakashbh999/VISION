-- ============================================================
-- Migration 022: Feature Upgrades
--   1. degree_id on study_groups          (degree-based filtering)
--   2. degree_id on resources             (degree-based filtering)
--   3. resource_status_type enum + status  (resource moderation)
--   4. is_moderator on users              (moderation flag)
--   5. is_boosted / boosted_until on discussions (post boosting)
--   6. user_badges table                  (gamification)
--   7. Triggers: like_count & comment_count auto-maintenance
--   8. Additional performance indexes
--
-- Safe to run multiple times (idempotent – uses IF NOT EXISTS, DO $$ guards)
-- Compatible with PostgreSQL 15+
-- ============================================================

BEGIN;

-- ============================================================
-- SECTION 1: degree_id on portal.study_groups
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal'
          AND table_name   = 'study_groups'
          AND column_name  = 'degree_id'
    ) THEN
        ALTER TABLE portal.study_groups
            ADD COLUMN degree_id INTEGER;

        ALTER TABLE portal.study_groups
            ADD CONSTRAINT study_groups_degree_id_fkey
            FOREIGN KEY (degree_id)
            REFERENCES portal.academic_degrees(id)
            ON DELETE SET NULL;

        RAISE NOTICE 'Added degree_id to portal.study_groups';
    ELSE
        RAISE NOTICE 'degree_id already exists on portal.study_groups – skipping';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_study_groups_degree
    ON portal.study_groups(degree_id);

-- ============================================================
-- SECTION 2: degree_id on portal.resources
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal'
          AND table_name   = 'resources'
          AND column_name  = 'degree_id'
    ) THEN
        ALTER TABLE portal.resources
            ADD COLUMN degree_id INTEGER;

        ALTER TABLE portal.resources
            ADD CONSTRAINT resources_degree_id_fkey
            FOREIGN KEY (degree_id)
            REFERENCES portal.academic_degrees(id)
            ON DELETE SET NULL;

        RAISE NOTICE 'Added degree_id to portal.resources';
    ELSE
        RAISE NOTICE 'degree_id already exists on portal.resources – skipping';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_resources_degree
    ON portal.resources(degree_id);

-- ============================================================
-- SECTION 3: Resource moderation status enum + column
-- ============================================================

-- Create the enum type (idempotent guard)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname  = 'resource_status_type'
          AND n.nspname  = 'portal'
    ) THEN
        CREATE TYPE portal.resource_status_type AS ENUM (
            'pending',
            'approved',
            'rejected'
        );
        RAISE NOTICE 'Created enum portal.resource_status_type';
    ELSE
        RAISE NOTICE 'Enum portal.resource_status_type already exists – skipping';
    END IF;
END $$;

-- Add the status column to resources
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal'
          AND table_name   = 'resources'
          AND column_name  = 'status'
    ) THEN
        ALTER TABLE portal.resources
            ADD COLUMN status portal.resource_status_type NOT NULL DEFAULT 'pending';

        RAISE NOTICE 'Added status column to portal.resources';
    ELSE
        RAISE NOTICE 'status column already exists on portal.resources – skipping';
    END IF;
END $$;

-- Full index on status (useful for admin dashboards listing all statuses)
CREATE INDEX IF NOT EXISTS idx_resources_status
    ON portal.resources(status);

-- Partial index for pending resources (most frequently queried by moderators)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'portal'
          AND tablename  = 'resources'
          AND indexname  = 'idx_resources_status_pending'
    ) THEN
        CREATE INDEX idx_resources_status_pending
            ON portal.resources(status)
            WHERE status = 'pending';
        RAISE NOTICE 'Created partial index idx_resources_status_pending';
    ELSE
        RAISE NOTICE 'Partial index idx_resources_status_pending already exists – skipping';
    END IF;
END $$;

-- ============================================================
-- SECTION 4: is_moderator flag on portal.users
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal'
          AND table_name   = 'users'
          AND column_name  = 'is_moderator'
    ) THEN
        ALTER TABLE portal.users
            ADD COLUMN is_moderator BOOLEAN NOT NULL DEFAULT false;

        RAISE NOTICE 'Added is_moderator to portal.users';
    ELSE
        RAISE NOTICE 'is_moderator already exists on portal.users – skipping';
    END IF;
END $$;

-- Partial index – only moderators need to be indexed (small subset)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'portal'
          AND tablename  = 'users'
          AND indexname  = 'idx_users_moderator'
    ) THEN
        CREATE INDEX idx_users_moderator
            ON portal.users(is_moderator)
            WHERE is_moderator = true;
        RAISE NOTICE 'Created partial index idx_users_moderator';
    ELSE
        RAISE NOTICE 'Partial index idx_users_moderator already exists – skipping';
    END IF;
END $$;

-- ============================================================
-- SECTION 5: Boost columns on portal.discussions
-- ============================================================

DO $$
BEGIN
    -- is_boosted
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal'
          AND table_name   = 'discussions'
          AND column_name  = 'is_boosted'
    ) THEN
        ALTER TABLE portal.discussions
            ADD COLUMN is_boosted BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Added is_boosted to portal.discussions';
    ELSE
        RAISE NOTICE 'is_boosted already exists on portal.discussions – skipping';
    END IF;

    -- boosted_until
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal'
          AND table_name   = 'discussions'
          AND column_name  = 'boosted_until'
    ) THEN
        ALTER TABLE portal.discussions
            ADD COLUMN boosted_until TIMESTAMPTZ;
        RAISE NOTICE 'Added boosted_until to portal.discussions';
    ELSE
        RAISE NOTICE 'boosted_until already exists on portal.discussions – skipping';
    END IF;
END $$;

-- Composite index for querying boosted discussions
CREATE INDEX IF NOT EXISTS idx_discussions_boost
    ON portal.discussions(is_boosted, boosted_until);

-- Partial index for boosted discussions (hot path)
-- NOTE: NOW() is not IMMUTABLE so cannot be used in index predicates;
-- query-time filtering on boosted_until is done in application SQL.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE schemaname = 'portal'
          AND tablename  = 'discussions'
          AND indexname  = 'idx_discussions_active_boost'
    ) THEN
        CREATE INDEX idx_discussions_active_boost
            ON portal.discussions(boosted_until DESC NULLS LAST)
            WHERE is_boosted = true;
        RAISE NOTICE 'Created partial index idx_discussions_active_boost';
    ELSE
        RAISE NOTICE 'Partial index idx_discussions_active_boost already exists – skipping';
    END IF;
END $$;

-- ============================================================
-- SECTION 6: portal.user_badges table (gamification)
-- ============================================================

CREATE TABLE IF NOT EXISTS portal.user_badges (
    user_id    INTEGER      NOT NULL
                           REFERENCES portal.users(user_id) ON DELETE CASCADE,
    badge_name VARCHAR(50)  NOT NULL,
    earned_at  TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, badge_name)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user
    ON portal.user_badges(user_id);

COMMENT ON TABLE portal.user_badges IS
    'Gamification: records badges earned by users. Composite PK prevents duplicate badges per user.';

-- ============================================================
-- SECTION 7: Triggers – auto-maintain like_count & comment_count
-- ============================================================

-- ── 7a. Function: increment / decrement like_count ──────────

CREATE OR REPLACE FUNCTION portal.fn_sync_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE portal.discussions
           SET like_count = COALESCE(like_count, 0) + 1
         WHERE discussion_id = NEW.discussion_id;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        UPDATE portal.discussions
           SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
         WHERE discussion_id = OLD.discussion_id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$;

-- Trigger on discussion_likes
DO $$
BEGIN
    -- DROP and recreate so any logic change is picked up on re-run
    DROP TRIGGER IF EXISTS trg_discussion_likes_count ON portal.discussion_likes;

    CREATE TRIGGER trg_discussion_likes_count
        AFTER INSERT OR DELETE
        ON portal.discussion_likes
        FOR EACH ROW
        EXECUTE FUNCTION portal.fn_sync_like_count();

    RAISE NOTICE 'Trigger trg_discussion_likes_count created/replaced';
END $$;

-- ── 7b. Function: increment / decrement comment_count ────────

CREATE OR REPLACE FUNCTION portal.fn_sync_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Only count non-deleted inserts
        IF NEW.is_deleted IS DISTINCT FROM true THEN
            UPDATE portal.discussions
               SET comment_count = COALESCE(comment_count, 0) + 1
             WHERE discussion_id = NEW.discussion_id;
        END IF;
        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        -- Only decrement if the deleted row was not already soft-deleted
        IF OLD.is_deleted IS DISTINCT FROM true THEN
            UPDATE portal.discussions
               SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
             WHERE discussion_id = OLD.discussion_id;
        END IF;
        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Soft-delete: is_deleted flipped false → true  = decrement
        IF OLD.is_deleted IS DISTINCT FROM true
           AND NEW.is_deleted = true THEN
            UPDATE portal.discussions
               SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)
             WHERE discussion_id = NEW.discussion_id;

        -- Soft-delete reversal: true → false = increment
        ELSIF OLD.is_deleted = true
              AND NEW.is_deleted IS DISTINCT FROM true THEN
            UPDATE portal.discussions
               SET comment_count = COALESCE(comment_count, 0) + 1
             WHERE discussion_id = NEW.discussion_id;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$;

-- Trigger on discussion_comments
DO $$
BEGIN
    DROP TRIGGER IF EXISTS trg_discussion_comments_count ON portal.discussion_comments;

    CREATE TRIGGER trg_discussion_comments_count
        AFTER INSERT OR DELETE OR UPDATE OF is_deleted
        ON portal.discussion_comments
        FOR EACH ROW
        EXECUTE FUNCTION portal.fn_sync_comment_count();

    RAISE NOTICE 'Trigger trg_discussion_comments_count created/replaced';
END $$;

-- ── 7c. One-time counter sync (reconcile any pre-trigger drift) ──

UPDATE portal.discussions d
   SET like_count = (
       SELECT COUNT(*)
         FROM portal.discussion_likes l
        WHERE l.discussion_id = d.discussion_id
   )
WHERE true;

UPDATE portal.discussions d
   SET comment_count = (
       SELECT COUNT(*)
         FROM portal.discussion_comments c
        WHERE c.discussion_id = d.discussion_id
          AND (c.is_deleted IS NULL OR c.is_deleted = false)
   )
WHERE true;

-- ============================================================
-- SECTION 8: Additional performance indexes
-- ============================================================

-- Composite index for resource listing by program + semester
CREATE INDEX IF NOT EXISTS idx_resources_program_semester
    ON portal.resources(program_id, semester);

-- Index on users.reputation_points (leaderboard queries)
CREATE INDEX IF NOT EXISTS idx_users_reputation
    ON portal.users(reputation_points DESC NULLS LAST);

-- Index on discussions.created_at if not already present (covered by 018, safe)
CREATE INDEX IF NOT EXISTS idx_discussions_created
    ON portal.discussions(created_at DESC);

-- ============================================================
-- Done
-- ============================================================

DO $$ BEGIN
    RAISE NOTICE '✅ Migration 022 completed successfully.';
END $$;

COMMIT;
