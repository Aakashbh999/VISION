-- Migration 058: Add current_streak to user_stats
-- Tracks consecutive daily activity for the 7-day streak bonus system.

BEGIN;

ALTER TABLE portal.user_stats
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0;

-- Index for efficient streak-based leaderboard queries later
CREATE INDEX IF NOT EXISTS idx_user_stats_streak
  ON portal.user_stats (current_streak DESC);

COMMIT;

DO $$ BEGIN RAISE NOTICE 'Migration 058 completed: current_streak added to user_stats'; END $$;
