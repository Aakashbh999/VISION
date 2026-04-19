-- Migration: Roadmap Proof of Work and VXP Enhancements

-- 1. Add verification keywords to roadmap steps
ALTER TABLE portal.roadmap_steps 
ADD COLUMN IF NOT EXISTS verification_keywords TEXT;

COMMENT ON COLUMN portal.roadmap_steps.verification_keywords IS 'Comma-separated keywords for auto-verification of submissions';

-- 2. Add submission columns to user progress
ALTER TABLE portal.user_roadmap_progress
ADD COLUMN IF NOT EXISTS submission_text TEXT,
ADD COLUMN IF NOT EXISTS submission_link TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS points_earned INTEGER;

COMMENT ON COLUMN portal.user_roadmap_progress.submission_text IS 'The key insight or proof of work submitted by the student';
COMMENT ON COLUMN portal.user_roadmap_progress.submission_link IS 'Optional external link to project or reference';
COMMENT ON COLUMN portal.user_roadmap_progress.is_verified IS 'Whether the submission met the keyword auto-verification criteria';
COMMENT ON COLUMN portal.user_roadmap_progress.points_earned IS 'The specific VXP granted for this step completion';
