-- Migration 019: Add reputation_points column to users table
-- This column is required for the existing trigger trg_update_reputation_on_like
-- which awards reputation points when users receive likes on their discussions

-- Add reputation_points column if it doesn't exist
ALTER TABLE portal.users ADD COLUMN IF NOT EXISTS reputation_points INTEGER DEFAULT 0;

-- Ensure the trigger function and trigger exist
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id INTEGER;
    delta INTEGER := 0;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.vote_type = 1 THEN
            delta := 5;
        END IF;
        target_user_id := (SELECT user_id FROM portal.discussions WHERE discussion_id = NEW.discussion_id);
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.vote_type = 1 THEN
            delta := -5;
        END IF;
        target_user_id := (SELECT user_id FROM portal.discussions WHERE discussion_id = OLD.discussion_id);
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.vote_type = 1 AND NEW.vote_type <> 1 THEN
            delta := -5;
        ELSIF OLD.vote_type <> 1 AND NEW.vote_type = 1 THEN
            delta := 5;
        END IF;
        target_user_id := (SELECT user_id FROM portal.discussions WHERE discussion_id = NEW.discussion_id);
    END IF;

    IF target_user_id IS NOT NULL AND delta <> 0 THEN
        UPDATE portal.users
        SET reputation_points = GREATEST(0, COALESCE(reputation_points, 0) + delta)
        WHERE user_id = target_user_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist (drop and recreate for idempotency)
DROP TRIGGER IF EXISTS trg_update_reputation_on_like ON portal.discussion_likes;
CREATE TRIGGER trg_update_reputation_on_like 
    AFTER INSERT OR UPDATE OR DELETE ON portal.discussion_likes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_reputation();

DO $$ BEGIN RAISE NOTICE 'Reputation system migration completed'; END $$;
