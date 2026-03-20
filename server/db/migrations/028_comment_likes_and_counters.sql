-- Migration 028: Adaptive Discussion - Comment Likes and Counters
-- Schema: portal

-- 1. Add likes_count (vote score) to discussion_comments
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'portal' AND table_name = 'discussion_comments' AND column_name = 'likes_count') THEN
        ALTER TABLE portal.discussion_comments ADD COLUMN likes_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Create comment_likes table
CREATE TABLE IF NOT EXISTS portal.comment_likes (
    comment_id INTEGER NOT NULL REFERENCES portal.discussion_comments(comment_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES portal.users(user_id) ON DELETE CASCADE,
    vote_type INTEGER DEFAULT 1 CHECK (vote_type IN (1, -1)),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id, user_id)
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON portal.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_likes_count ON portal.discussion_comments(likes_count);
