 -- Migration: Roadmap Submission Review Workflow

-- Add columns for administrative review to user_roadmap_progress
ALTER TABLE portal.user_roadmap_progress
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS admin_feedback TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewer_id INTEGER REFERENCES portal.users(user_id);

-- Initialize verification_status for existing completions
UPDATE portal.user_roadmap_progress
SET verification_status = CASE 
    WHEN submission_text IS NOT NULL AND is_verified = TRUE THEN 'approved'
    WHEN submission_text IS NOT NULL AND is_verified = FALSE THEN 'pending'
    ELSE 'none'
END
WHERE verification_status = 'none';

COMMENT ON COLUMN portal.user_roadmap_progress.verification_status IS 'none, pending, approved, rejected';
COMMENT ON COLUMN portal.user_roadmap_progress.admin_feedback IS 'Feedback provided by the admin during review';
COMMENT ON COLUMN portal.user_roadmap_progress.reviewed_at IS 'When the submission was reviewed';
COMMENT ON COLUMN portal.user_roadmap_progress.reviewer_id IS 'Which admin reviewed the submission';
