-- Fix tags table structure for Discussion System 2.0

-- Add slug column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'tags' AND column_name = 'slug') THEN
        ALTER TABLE portal.tags ADD COLUMN slug VARCHAR(50) UNIQUE;
    END IF;
END $$;

-- Rename tag_name to name if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'portal' AND table_name = 'tags' AND column_name = 'tag_name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'portal' AND table_name = 'tags' AND column_name = 'name') THEN
        ALTER TABLE portal.tags RENAME COLUMN tag_name TO name;
    END IF;
END $$;

-- Add created_at if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'tags' AND column_name = 'created_at') THEN
        ALTER TABLE portal.tags ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

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
