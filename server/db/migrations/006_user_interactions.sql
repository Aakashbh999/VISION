-- ============================================
-- Migration: 006_user_interactions.sql
-- Tracks how students interact with learning resources
-- ============================================

CREATE TABLE IF NOT EXISTS portal.user_resource_interactions (
    interaction_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INT NOT NULL REFERENCES portal.users(user_id) ON DELETE CASCADE,
    resource_id INT NOT NULL REFERENCES portal.resources(resource_id) ON DELETE CASCADE,

    interaction_type VARCHAR(20) NOT NULL CHECK (
        interaction_type IN ('view','click','bookmark','complete','like','dislike')
    ),

    interaction_value SMALLINT DEFAULT 1, 
    -- future scoring weight (example: watch time, rating weight)

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Prevent spam duplicate actions (one like/bookmark per user per resource)
CREATE UNIQUE INDEX IF NOT EXISTS unique_user_resource_action
ON portal.user_resource_interactions(user_id, resource_id, interaction_type)
WHERE interaction_type IN ('bookmark','like','dislike','complete');
