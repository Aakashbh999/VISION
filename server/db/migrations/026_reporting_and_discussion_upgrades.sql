-- Migration 026: Universal Reporting, Soft Deletes, and Nested Comments
-- Schema: portal

-- 1. Universal Reporting Table
CREATE TABLE IF NOT EXISTS portal.reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id INTEGER REFERENCES portal.users(user_id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('discussion', 'comment', 'group', 'resource')),
    target_id TEXT NOT NULL, -- Stored as text to handle both Integer and UUID target IDs
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Discussion Upgrades: Soft Deletes
-- Add deleted_at to discussions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussions' AND column_name = 'deleted_at') THEN
        ALTER TABLE portal.discussions ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add deleted_at to discussion_comments
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussion_comments' AND column_name = 'deleted_at') THEN
        ALTER TABLE portal.discussion_comments ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 3. Nested Comments Support
-- Add parent_id to discussion_comments
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussion_comments' AND column_name = 'parent_id') THEN
        ALTER TABLE portal.discussion_comments ADD COLUMN parent_id INTEGER REFERENCES portal.discussion_comments(comment_id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Ensure VisionXP user_stats exists (safety check)
CREATE TABLE IF NOT EXISTS portal.user_stats (
    user_id INTEGER PRIMARY KEY REFERENCES portal.users(user_id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    roadmaps_completed INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all users have a stats row
INSERT INTO portal.user_stats (user_id)
SELECT user_id FROM portal.users
ON CONFLICT (user_id) DO NOTHING;

-- 5. Indexes for soft deletes
CREATE INDEX IF NOT EXISTS idx_discussions_deleted_at ON portal.discussions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON portal.discussion_comments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_reports_target ON portal.reports(target_type, target_id);
