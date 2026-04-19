-- Migration: 063 - Roadmap Anti-Spam and Lockout Rules
-- Purpose: Track high-level roadmap enrolment status (Active/Completed/Left) and enforce single-enrolment/lockout rules.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roadmap_user_status' AND typnamespace = 'portal'::regnamespace) THEN
        CREATE TYPE portal.roadmap_user_status AS ENUM ('active', 'completed', 'left');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS portal.user_roadmap_enrolments (
    enrolment_id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id integer NOT NULL REFERENCES portal.users(user_id) ON DELETE CASCADE,
    roadmap_id integer NOT NULL REFERENCES portal.roadmaps(roadmap_id) ON DELETE CASCADE,
    status portal.roadmap_user_status DEFAULT 'active',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_user_roadmap_enrolment UNIQUE(user_id, roadmap_id)
);

-- Index for checking active roadmaps quickly
CREATE INDEX IF NOT EXISTS idx_user_active_roadmap_enrolment ON portal.user_roadmap_enrolments(user_id) WHERE status = 'active';

-- Index for checking lockout
CREATE INDEX IF NOT EXISTS idx_user_left_roadmap_enrolment ON portal.user_roadmap_enrolments(user_id) WHERE status = 'left';

-- Add comment for documentation
COMMENT ON TABLE portal.user_roadmap_enrolments IS 'Tracks the high-level participation state of a user in a specific roadmap.';
