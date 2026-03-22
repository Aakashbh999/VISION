-- Migration 017: Resource Schema Cleanup & Enhancement
-- This migration cleans up and normalizes resource-related tables
-- Safe to run multiple times (idempotent with IF NOT EXISTS and exception handling)

-- ============================================
-- 1. CREATE ENUMS (IF NOT EXISTS)
-- ============================================

-- Create difficulty_level_enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level_enum' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'portal')) THEN
        CREATE TYPE portal.difficulty_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
    END IF;
END $$;

-- ============================================
-- 2. UPDATE resources TABLE
-- ============================================

-- Add difficulty_level column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'portal' 
        AND table_name = 'resources' 
        AND column_name = 'difficulty_level'
    ) THEN
        ALTER TABLE portal.resources ADD COLUMN difficulty_level portal.difficulty_level_enum DEFAULT 'beginner';
    END IF;
END $$;

-- Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'portal' 
        AND table_name = 'resources' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE portal.resources ADD COLUMN created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Make url NOT NULL if it isn't already (update existing nulls first)
UPDATE portal.resources SET url = '' WHERE url IS NULL;

-- Create indexes for resources table (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_resources_subject ON portal.resources(subject_name);
CREATE INDEX IF NOT EXISTS idx_resources_program ON portal.resources(program_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON portal.resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_resources_difficulty ON portal.resources(difficulty_level);

-- ============================================
-- 3. UPDATE resource_scores TABLE
-- ============================================

-- Add check constraint for score range (0-100)
DO $$
BEGIN
    -- First check if constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'portal' 
        AND table_name = 'resource_scores' 
        AND constraint_name = 'resource_scores_score_check'
    ) THEN
        ALTER TABLE portal.resource_scores ADD CONSTRAINT resource_scores_score_check CHECK (score >= 0 AND score <= 100);
    END IF;
EXCEPTION
    WHEN check_violation THEN
        -- If there are values violating the constraint, fix them first
        UPDATE portal.resource_scores SET score = LEAST(GREATEST(score, 0), 100);
        ALTER TABLE portal.resource_scores ADD CONSTRAINT resource_scores_score_check CHECK (score >= 0 AND score <= 100);
END $$;

-- Create indexes for resource_scores table
CREATE INDEX IF NOT EXISTS idx_resource_scores_score ON portal.resource_scores(score);
CREATE INDEX IF NOT EXISTS idx_resource_scores_user ON portal.resource_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_scores_resource ON portal.resource_scores(resource_id);

-- ============================================
-- 4. CREATE resource_tags TABLE (IF NOT EXISTS)
-- ============================================

CREATE TABLE IF NOT EXISTS portal.resource_tags (
    resource_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,

    PRIMARY KEY (resource_id, tag_id),

    CONSTRAINT resource_tags_resource_id_fkey
        FOREIGN KEY (resource_id)
        REFERENCES portal.resources(resource_id)
        ON DELETE CASCADE,

    CONSTRAINT resource_tags_tag_id_fkey
        FOREIGN KEY (tag_id)
        REFERENCES portal.tags(tag_id)
        ON DELETE CASCADE
);

-- ============================================
-- 5. UPDATE roadmaps TABLE - ADD specialization_id (links to it_fields.id)
-- ============================================

-- Add specialization_id column if it doesn't exist (references it_fields.id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'portal' 
        AND table_name = 'roadmaps' 
        AND column_name = 'specialization_id'
    ) THEN
        ALTER TABLE portal.roadmaps ADD COLUMN specialization_id INTEGER;
        
        -- Add foreign key constraint to it_fields table
        ALTER TABLE portal.roadmaps 
            ADD CONSTRAINT roadmaps_specialization_id_fkey 
            FOREIGN KEY (specialization_id) 
            REFERENCES portal.it_fields(id) 
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_roadmaps_specialization ON portal.roadmaps(specialization_id);

-- ============================================
-- 6. UPDATE roadmap_steps TABLE - Add indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_roadmap_steps_roadmap ON portal.roadmap_steps(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_steps_order ON portal.roadmap_steps(step_order);

-- ============================================
-- 7. Ensure step_resource_map has proper structure
-- ============================================

-- Already has proper structure from 008, just add index if missing
CREATE INDEX IF NOT EXISTS idx_step_resource_map_step ON portal.step_resource_map(step_id);
CREATE INDEX IF NOT EXISTS idx_step_resource_map_resource ON portal.step_resource_map(resource_id);

-- ============================================
-- 8. Summary Comment
-- ============================================

COMMENT ON TABLE portal.resources IS 'Learning resources with difficulty levels, linked to programs and roadmap steps';
COMMENT ON TABLE portal.resource_scores IS 'User-specific resource scores for personalized recommendations (0-100 scale)';
COMMENT ON TABLE portal.resource_tags IS 'Many-to-many relationship between resources and tags for categorization';
COMMENT ON TABLE portal.roadmaps IS 'Learning roadmaps that can be linked to IT specializations via specialization_id (it_fields.id)';
COMMENT ON TABLE portal.roadmap_steps IS 'Individual steps within a roadmap, ordered by step_order';
COMMENT ON TABLE portal.step_resource_map IS 'Maps resources to roadmap steps with required/optional flag';
