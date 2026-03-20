-- Migration 027: Synced Vote System for Discussions
-- Schema: portal

-- Add vote_type to discussion_likes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussion_likes' AND column_name = 'vote_type') THEN
        ALTER TABLE portal.discussion_likes ADD COLUMN vote_type INTEGER DEFAULT 1 CHECK (vote_type IN (1, -1));
    END IF;
END $$;

-- Update existing likes to have vote_type = 1
UPDATE portal.discussion_likes SET vote_type = 1 WHERE vote_type IS NULL;

-- Rename like_count to vote_score in discussions for clarity (optional, but let's keep it as is to avoid breaking many things, or just update labels)
-- The user said "decrement the visual counter", so we'll treat like_count as the total score.
