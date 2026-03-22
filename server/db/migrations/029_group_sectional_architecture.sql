-- Migration 029: Group Sectional Architecture
-- Adds support for 5 distinct sections within groups: notice_board, discussion, qa, resources, general

DO $$ 
BEGIN
    -- Add section column to group_posts
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'group_posts' AND column_name = 'section') THEN
        ALTER TABLE portal.group_posts ADD COLUMN section VARCHAR(50) DEFAULT 'general';
        RAISE NOTICE 'Added section column to portal.group_posts';
    END IF;

    -- Add index for sectional filtering performance
    IF NOT EXISTS (SELECT 1 FROM pg_indexes 
                   WHERE schemaname = 'portal' AND tablename = 'group_posts' AND indexname = 'idx_group_posts_section') THEN
        CREATE INDEX idx_group_posts_section ON portal.group_posts(group_id, section);
        RAISE NOTICE 'Created index idx_group_posts_section';
    END IF;
END $$;
