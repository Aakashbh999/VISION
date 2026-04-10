-- Migration 054: Sync Vote Scores
-- Re-calibrates all discussion and comment scores to follow the "Upvote-only" system.
-- This fixes any data inconsistencies introduced during recent development.

BEGIN;

-- 1. Sync Discussion Like Counts (Reset to Upvote-only)
UPDATE portal.discussions d
SET like_count = (
    SELECT COUNT(*) 
    FROM portal.discussion_likes dl 
    WHERE dl.discussion_id = d.discussion_id 
    AND dl.vote_type = 1
);

-- 2. Sync Comment Like Counts (Reset to Upvote-only)
UPDATE portal.discussion_comments c
SET likes_count = (
    SELECT COUNT(*) 
    FROM portal.comment_likes cl 
    WHERE cl.comment_id = c.comment_id 
    AND cl.vote_type = 1
);

-- 3. Verify counts for deleted items (optional, but good for consistency)
-- Items that are soft-deleted should still have their counts synced, but
-- typically we don't display them anyway.

COMMIT;

DO $$ BEGIN RAISE NOTICE 'Migration 054 completed: vote scores synchronized'; END $$;
