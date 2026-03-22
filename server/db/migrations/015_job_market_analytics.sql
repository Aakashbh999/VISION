-- Migration: Job Market Analytics Tables
-- Creates normalized structure for job market intelligence

-- ============================================
-- 1. Create skills table (master skill list)
-- ============================================
CREATE TABLE IF NOT EXISTS portal.skills (
    skill_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50), -- e.g., 'programming', 'framework', 'tool', 'soft_skill'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. Create jobs table (job postings)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'experience_level_type') THEN
        CREATE TYPE portal.experience_level_type AS ENUM ('entry', 'mid', 'senior');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS portal.jobs (
    job_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    company VARCHAR(150),
    location VARCHAR(100),
    salary_min INTEGER,
    salary_max INTEGER,
    experience_level portal.experience_level_type DEFAULT 'entry',
    field_id INTEGER REFERENCES portal.it_fields(id) ON DELETE SET NULL,
    description TEXT,
    requirements TEXT,
    is_remote BOOLEAN DEFAULT false,
    source VARCHAR(100), -- e.g., 'linkedin', 'indeed', 'manual'
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. Create job_skills junction table
-- ============================================
CREATE TABLE IF NOT EXISTS portal.job_skills (
    job_id INTEGER REFERENCES portal.jobs(job_id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES portal.skills(skill_id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT true, -- required vs nice-to-have
    PRIMARY KEY (job_id, skill_id)
);

-- ============================================
-- 4. Create field_skills table (skills associated with IT fields)
-- ============================================
CREATE TABLE IF NOT EXISTS portal.field_skills (
    field_id INTEGER REFERENCES portal.it_fields(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES portal.skills(skill_id) ON DELETE CASCADE,
    importance_score INTEGER DEFAULT 50 CHECK (importance_score >= 0 AND importance_score <= 100),
    PRIMARY KEY (field_id, skill_id)
);

-- ============================================
-- 5. Add analytics columns to it_fields if missing
-- ============================================
DO $$ 
BEGIN
    -- average_salary
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'it_fields' AND column_name = 'average_salary') THEN
        ALTER TABLE portal.it_fields ADD COLUMN average_salary INTEGER;
    END IF;
    
    -- growth_rate (percentage)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'it_fields' AND column_name = 'growth_rate') THEN
        ALTER TABLE portal.it_fields ADD COLUMN growth_rate DECIMAL(5,2);
    END IF;
    
    -- job_count (cached count for quick access)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'it_fields' AND column_name = 'job_count') THEN
        ALTER TABLE portal.it_fields ADD COLUMN job_count INTEGER DEFAULT 0;
    END IF;
    
    RAISE NOTICE 'it_fields analytics columns added';
END $$;

-- ============================================
-- 6. Create user_skills table (track user's skills)
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proficiency_level_type') THEN
        CREATE TYPE portal.proficiency_level_type AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS portal.user_skills (
    user_id INTEGER REFERENCES portal.users(user_id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES portal.skills(skill_id) ON DELETE CASCADE,
    proficiency_level portal.proficiency_level_type DEFAULT 'beginner',
    verified BOOLEAN DEFAULT false,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, skill_id)
);

-- ============================================
-- 7. Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_jobs_field ON portal.jobs(field_id);
CREATE INDEX IF NOT EXISTS idx_jobs_experience ON portal.jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_salary ON portal.jobs(salary_min, salary_max);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON portal.jobs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_jobs_posted ON portal.jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON portal.job_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_field_skills_field ON portal.field_skills(field_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON portal.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON portal.skills(category);

-- ============================================
-- 8. Insert seed skills data
-- ============================================
INSERT INTO portal.skills (name, category) VALUES
    -- Programming Languages
    ('JavaScript', 'programming'),
    ('Python', 'programming'),
    ('Java', 'programming'),
    ('TypeScript', 'programming'),
    ('C++', 'programming'),
    ('C#', 'programming'),
    ('Go', 'programming'),
    ('Rust', 'programming'),
    ('PHP', 'programming'),
    ('Ruby', 'programming'),
    ('Swift', 'programming'),
    ('Kotlin', 'programming'),
    
    -- Frontend Frameworks
    ('React', 'framework'),
    ('Vue.js', 'framework'),
    ('Angular', 'framework'),
    ('Next.js', 'framework'),
    ('Svelte', 'framework'),
    
    -- Backend Frameworks
    ('Node.js', 'framework'),
    ('Express.js', 'framework'),
    ('Django', 'framework'),
    ('Flask', 'framework'),
    ('Spring Boot', 'framework'),
    ('ASP.NET', 'framework'),
    ('FastAPI', 'framework'),
    ('Laravel', 'framework'),
    
    -- Databases
    ('PostgreSQL', 'database'),
    ('MySQL', 'database'),
    ('MongoDB', 'database'),
    ('Redis', 'database'),
    ('SQLite', 'database'),
    ('Oracle', 'database'),
    ('SQL Server', 'database'),
    
    -- Cloud & DevOps
    ('AWS', 'cloud'),
    ('Azure', 'cloud'),
    ('Google Cloud', 'cloud'),
    ('Docker', 'devops'),
    ('Kubernetes', 'devops'),
    ('CI/CD', 'devops'),
    ('Terraform', 'devops'),
    ('Jenkins', 'devops'),
    ('Git', 'tool'),
    ('Linux', 'tool'),
    
    -- Data & AI
    ('Machine Learning', 'ai'),
    ('Deep Learning', 'ai'),
    ('TensorFlow', 'ai'),
    ('PyTorch', 'ai'),
    ('Data Analysis', 'data'),
    ('SQL', 'data'),
    ('Pandas', 'data'),
    ('Power BI', 'data'),
    ('Tableau', 'data'),
    
    -- Mobile
    ('React Native', 'mobile'),
    ('Flutter', 'mobile'),
    ('iOS Development', 'mobile'),
    ('Android Development', 'mobile'),
    
    -- Security
    ('Cybersecurity', 'security'),
    ('Penetration Testing', 'security'),
    ('OWASP', 'security'),
    ('Network Security', 'security'),
    
    -- Soft Skills
    ('Problem Solving', 'soft_skill'),
    ('Communication', 'soft_skill'),
    ('Team Collaboration', 'soft_skill'),
    ('Agile/Scrum', 'soft_skill'),
    ('Project Management', 'soft_skill')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Done
-- ============================================
SELECT '✅ Job Market Analytics migration completed' AS status;
