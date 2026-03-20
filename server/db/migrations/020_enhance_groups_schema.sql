-- Migration 020: Enhance Groups Schema
-- Adds missing columns for the enhanced groups feature

-- Add joined_at to group_members if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'group_members' AND column_name = 'joined_at') THEN
        ALTER TABLE portal.group_members ADD COLUMN joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Ensure study_groups has all needed columns
DO $$
BEGIN
    -- Add group_image column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'group_image') THEN
        ALTER TABLE portal.study_groups ADD COLUMN group_image TEXT;
    END IF;
    
    -- Add group_image_public_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'group_image_public_id') THEN
        ALTER TABLE portal.study_groups ADD COLUMN group_image_public_id TEXT;
    END IF;
    
    -- Add banner_image column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'banner_image') THEN
        ALTER TABLE portal.study_groups ADD COLUMN banner_image TEXT;
    END IF;
    
    -- Add banner_image_public_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'banner_image_public_id') THEN
        ALTER TABLE portal.study_groups ADD COLUMN banner_image_public_id TEXT;
    END IF;
    
    -- Add is_public column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'study_groups' AND column_name = 'is_public') THEN
        ALTER TABLE portal.study_groups ADD COLUMN is_public BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_members_group ON portal.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON portal.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_group ON portal.group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_created ON portal.group_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_groups_name ON portal.study_groups USING gin(to_tsvector('english', name));

-- Create a view alias for compatibility (if groups view doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.views WHERE table_schema = 'portal' AND table_name = 'groups') THEN
        EXECUTE 'CREATE VIEW portal.groups AS SELECT * FROM portal.study_groups';
    END IF;
EXCEPTION WHEN duplicate_table THEN
    -- View already exists
    NULL;
END $$;

DO $$ BEGIN RAISE NOTICE 'Groups schema enhancement completed'; END $$;
