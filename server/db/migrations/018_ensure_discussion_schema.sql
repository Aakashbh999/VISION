-- Migration 018: Ensure Discussion System Schema
-- This migration ensures all required tables and columns exist for the discussion system
-- Safe to run multiple times (uses IF NOT EXISTS)

-- ============================================
-- 1. Ensure reference tables exist
-- ============================================

-- IT Fields table (specializations)
CREATE TABLE IF NOT EXISTS portal.it_fields (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    field_name TEXT,
    short_description TEXT,
    description_full TEXT,
    tech_stack_hint TEXT,
    demand_level TEXT,
    icon_name TEXT,
    is_public BOOLEAN DEFAULT true
);

-- Academic Degrees table
CREATE TABLE IF NOT EXISTS portal.academic_degrees (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    degree_code TEXT,
    full_name TEXT,
    university TEXT,
    duration TEXT,
    eligibility TEXT,
    focus_area TEXT,
    admission_process TEXT,
    is_public BOOLEAN DEFAULT true
);

-- Job Market Insights table
CREATE TABLE IF NOT EXISTS portal.job_market_insights (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE,
    role_name TEXT,
    salary_range TEXT,
    market_demand TEXT,
    key_skills TEXT,
    job_summary TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT true
);

-- ============================================
-- 2. Ensure discussions table has all columns
-- ============================================
DO $$ 
BEGIN
    -- Add specialization_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'specialization_id') THEN
        ALTER TABLE portal.discussions ADD COLUMN specialization_id INTEGER;
    END IF;
    
    -- Add degree_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'degree_id') THEN
        ALTER TABLE portal.discussions ADD COLUMN degree_id INTEGER;
    END IF;
    
    -- Add job_role_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'job_role_id') THEN
        ALTER TABLE portal.discussions ADD COLUMN job_role_id INTEGER;
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'updated_at') THEN
        ALTER TABLE portal.discussions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add comment_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'comment_count') THEN
        ALTER TABLE portal.discussions ADD COLUMN comment_count INTEGER DEFAULT 0;
    END IF;
    
    RAISE NOTICE 'Discussion columns ensured';
END $$;

-- ============================================
-- 3. Ensure tags tables exist
-- ============================================
CREATE TABLE IF NOT EXISTS portal.tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraints if not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tags_name_unique') THEN
        ALTER TABLE portal.tags ADD CONSTRAINT tags_name_unique UNIQUE (name);
    END IF;
EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists
    NULL;
END $$;

-- Discussion tags junction table
CREATE TABLE IF NOT EXISTS portal.discussion_tags (
    discussion_id INTEGER REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES portal.tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (discussion_id, tag_id)
);

-- ============================================
-- 4. Ensure saved_discussions table exists
-- ============================================
CREATE TABLE IF NOT EXISTS portal.saved_discussions (
    user_id INTEGER REFERENCES portal.users(user_id) ON DELETE CASCADE,
    discussion_id INTEGER REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, discussion_id)
);

-- ============================================
-- 5. Ensure discussion_comments table exists (new comment system)
-- ============================================
CREATE TABLE IF NOT EXISTS portal.discussion_comments (
    comment_id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES portal.users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. Insert default tags if table is empty
-- ============================================
INSERT INTO portal.tags (name, slug) 
SELECT name, slug FROM (VALUES
    ('React', 'react'),
    ('Python', 'python'),
    ('JavaScript', 'javascript'),
    ('Machine Learning', 'machine-learning'),
    ('Web Development', 'web-development'),
    ('Mobile Development', 'mobile-development'),
    ('Database', 'database'),
    ('Security', 'security'),
    ('DevOps', 'devops'),
    ('Cloud Computing', 'cloud-computing'),
    ('Data Science', 'data-science'),
    ('Internship', 'internship'),
    ('Career Advice', 'career-advice'),
    ('Study Tips', 'study-tips'),
    ('Project Help', 'project-help'),
    ('Interview Prep', 'interview-prep'),
    ('Node.js', 'nodejs'),
    ('Java', 'java'),
    ('PHP', 'php'),
    ('C++', 'cpp')
) AS default_tags(name, slug)
WHERE NOT EXISTS (SELECT 1 FROM portal.tags LIMIT 1)
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_discussions_specialization ON portal.discussions(specialization_id);
CREATE INDEX IF NOT EXISTS idx_discussions_degree ON portal.discussions(degree_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created ON portal.discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_tags_discussion ON portal.discussion_tags(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_tags_tag ON portal.discussion_tags(tag_id);

-- ============================================
-- 8. Fix NULL values and sync counters
-- ============================================
-- Set NULL comment_count to 0
UPDATE portal.discussions SET comment_count = 0 WHERE comment_count IS NULL;

-- Set NULL like_count to 0
UPDATE portal.discussions SET like_count = 0 WHERE like_count IS NULL;

-- Sync comment_count with actual comments
UPDATE portal.discussions d 
SET comment_count = (
  SELECT COUNT(*) 
  FROM portal.discussion_comments c 
  WHERE c.discussion_id = d.discussion_id 
  AND (c.is_deleted IS NULL OR c.is_deleted = FALSE)
);

-- Sync like_count with actual likes
UPDATE portal.discussions d 
SET like_count = (
  SELECT COUNT(*) 
  FROM portal.discussion_likes l 
  WHERE l.discussion_id = d.discussion_id
);

DO $$ BEGIN RAISE NOTICE 'Discussion system schema ensured successfully'; END $$;
