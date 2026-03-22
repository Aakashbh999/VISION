-- Migration 039: 2-Step Registration & Tag System
BEGIN;

DO $$
BEGIN
    -- Add current_education
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'current_education') THEN
        ALTER TABLE portal.users ADD COLUMN current_education TEXT;
        RAISE NOTICE 'Added current_education to portal.users';
    END IF;

    -- Add target_exam
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'target_exam') THEN
        ALTER TABLE portal.users ADD COLUMN target_exam TEXT;
        RAISE NOTICE 'Added target_exam to portal.users';
    END IF;

    -- Add career_scope (Tags)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'career_scope') THEN
        ALTER TABLE portal.users ADD COLUMN career_scope TEXT;
        RAISE NOTICE 'Added career_scope to portal.users';
    END IF;

    -- Add registration_step
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'registration_step') THEN
        ALTER TABLE portal.users ADD COLUMN registration_step INTEGER DEFAULT 1;
        RAISE NOTICE 'Added registration_step to portal.users';
    END IF;
END $$;

COMMENT ON COLUMN portal.users.career_scope IS 'Industry-ready tags as a comma-separated string or JSON array.';

COMMIT;
