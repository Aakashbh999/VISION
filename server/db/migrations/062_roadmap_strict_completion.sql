-- Migration: 062 - Roadmap Strict Completion Rules
-- 1. Remove redundancy from PoW Review (Drop moderation columns)
ALTER TABLE portal.user_roadmap_progress
DROP COLUMN IF EXISTS verification_status,
DROP COLUMN IF EXISTS admin_feedback,
DROP COLUMN IF EXISTS reviewed_at,
DROP COLUMN IF EXISTS reviewer_id;

-- 2. Add tracking for strict completion rules
ALTER TABLE portal.user_roadmap_progress
ADD COLUMN IF NOT EXISTS first_viewed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN portal.user_roadmap_progress.first_viewed_at IS 'The timestamp when the user first interacted with any resource in this step. Used for the 24h lockout rule.';

-- 3. Cleanup roadmap_steps (Remove verification keywords)
ALTER TABLE portal.roadmap_steps
DROP COLUMN IF EXISTS verification_keywords;
