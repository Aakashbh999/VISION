-- Migration 016: Discussion System 2.0 Upgrade
-- Features: Advanced filtering, tags, comments, saved posts, edit tracking

-- ============================================
-- 1. Add specialization/degree fields to users table for default filtering
-- ============================================
DO $$ 
BEGIN
    -- Add it_field_id (specialization) to users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'it_field_id') THEN
        ALTER TABLE portal.users ADD COLUMN it_field_id INTEGER REFERENCES portal.it_fields(id) ON DELETE SET NULL;
    END IF;
    
    -- Add academic_degree_id to users
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'academic_degree_id') THEN
        ALTER TABLE portal.users ADD COLUMN academic_degree_id INTEGER REFERENCES portal.academic_degrees(id) ON DELETE SET NULL;
    END IF;
    
    RAISE NOTICE 'User specialization fields added';
END $$;

-- ============================================
-- 2. Add filtering fields to discussions table
-- ============================================
DO $$ 
BEGIN
    -- Add specialization_id (it_field_id)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'specialization_id') THEN
        ALTER TABLE portal.discussions ADD COLUMN specialization_id INTEGER REFERENCES portal.it_fields(id) ON DELETE SET NULL;
    END IF;
    
    -- Add job_role_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'job_role_id') THEN
        ALTER TABLE portal.discussions ADD COLUMN job_role_id INTEGER REFERENCES portal.job_market_insights(id) ON DELETE SET NULL;
    END IF;
    
    -- Add degree_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'degree_id') THEN
        ALTER TABLE portal.discussions ADD COLUMN degree_id INTEGER REFERENCES portal.academic_degrees(id) ON DELETE SET NULL;
    END IF;
    
    -- Add updated_at for edit tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'updated_at') THEN
        ALTER TABLE portal.discussions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add comment_count (cached for performance)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'comment_count') THEN
        ALTER TABLE portal.discussions ADD COLUMN comment_count INTEGER DEFAULT 0;
    END IF;
    
    RAISE NOTICE 'Discussion filtering fields added';
END $$;

-- ============================================
-- 3. Create tags system
-- ============================================
CREATE TABLE IF NOT EXISTS portal.tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many relationship: discussions <-> tags
CREATE TABLE IF NOT EXISTS portal.discussion_tags (
    discussion_id INTEGER REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES portal.tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (discussion_id, tag_id)
);

-- Insert default tags
INSERT INTO portal.tags (name, slug) VALUES
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
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 4. Rename discussion_replies to discussion_comments
-- ============================================
DO $$
BEGIN
    -- Rename table if exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'portal' AND table_name = 'discussion_replies') THEN
        ALTER TABLE portal.discussion_replies RENAME TO discussion_comments;
    END IF;
    
    -- Rename primary key column if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'portal' AND table_name = 'discussion_comments' AND column_name = 'reply_id') THEN
        ALTER TABLE portal.discussion_comments RENAME COLUMN reply_id TO comment_id;
    END IF;
END $$;

-- Create comment table if it doesn't exist (for fresh installs)
CREATE TABLE IF NOT EXISTS portal.discussion_comments (
    comment_id SERIAL PRIMARY KEY,
    discussion_id INTEGER REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES portal.users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. Create saved posts table
-- ============================================
CREATE TABLE IF NOT EXISTS portal.saved_discussions (
    user_id INTEGER REFERENCES portal.users(user_id) ON DELETE CASCADE,
    discussion_id INTEGER REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, discussion_id)
);

-- ============================================
-- 6. Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_discussions_specialization ON portal.discussions(specialization_id);
CREATE INDEX IF NOT EXISTS idx_discussions_degree ON portal.discussions(degree_id);
CREATE INDEX IF NOT EXISTS idx_discussions_job_role ON portal.discussions(job_role_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON portal.discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_like_count ON portal.discussions(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_discussions_comment_count ON portal.discussions(comment_count DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_tags_discussion ON portal.discussion_tags(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_tags_tag ON portal.discussion_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_saved_discussions_user ON portal.saved_discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussion_comments_discussion ON portal.discussion_comments(discussion_id);

-- ============================================
-- 7. Update existing comment counts
-- ============================================
UPDATE portal.discussions d
SET comment_count = (
    SELECT COUNT(*) 
    FROM portal.discussion_comments c 
    WHERE c.discussion_id = d.discussion_id 
    AND (c.is_deleted IS NULL OR c.is_deleted = FALSE)
);

-- ============================================
-- 8. Add reference_id to notifications for discussion/comment links
-- ============================================
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'notifications' AND column_name = 'reference_id') THEN
        ALTER TABLE portal.notifications ADD COLUMN reference_id INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'notifications' AND column_name = 'reference_type') THEN
        ALTER TABLE portal.notifications ADD COLUMN reference_type VARCHAR(50);
    END IF;
    
    RAISE NOTICE 'Discussion System 2.0 migration completed!';
END $$;
