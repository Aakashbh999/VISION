-- Optimizations for the Activity Feed system
-- Created: 2026-04-09

-- Add index for action_type to optimize tabbed filtering
CREATE INDEX IF NOT EXISTS idx_activity_feed_action_type 
ON portal.activity_feed(action_type);

-- Add composite index for chronologically sorted tabbed feeds
-- This significantly speeds up ORDER BY relevance_score DESC, created_at DESC 
-- when filtered by action_type
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_action 
ON portal.activity_feed(created_at DESC, action_type);

-- ANALYZE table to update statistics for the new indices
ANALYZE portal.activity_feed;
