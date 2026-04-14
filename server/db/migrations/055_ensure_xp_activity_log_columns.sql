-- Migration 055: Ensure XP activity log schema matches XP service writes
-- Fixes environments where xp_activity_log exists without new_total/new_level columns.

BEGIN;

CREATE TABLE IF NOT EXISTS portal.xp_activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES portal.users(user_id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT,
    new_total INTEGER,
    new_level INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE portal.xp_activity_log
    ADD COLUMN IF NOT EXISTS user_id INTEGER,
    ADD COLUMN IF NOT EXISTS amount INTEGER,
    ADD COLUMN IF NOT EXISTS reason TEXT,
    ADD COLUMN IF NOT EXISTS new_total INTEGER,
    ADD COLUMN IF NOT EXISTS new_level INTEGER,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();

-- Add FK only if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'xp_activity_log_user_id_fkey'
          AND conrelid = 'portal.xp_activity_log'::regclass
    ) THEN
        ALTER TABLE portal.xp_activity_log
            ADD CONSTRAINT xp_activity_log_user_id_fkey
            FOREIGN KEY (user_id)
            REFERENCES portal.users(user_id)
            ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_xp_activity_log_user_id
    ON portal.xp_activity_log (user_id);

CREATE INDEX IF NOT EXISTS idx_xp_activity_log_created_at
    ON portal.xp_activity_log (created_at DESC);

COMMIT;

DO $$ BEGIN RAISE NOTICE 'Migration 055 completed: xp_activity_log schema ensured'; END $$;
