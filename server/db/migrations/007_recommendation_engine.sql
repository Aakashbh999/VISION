-- ============================================
-- Migration: 007_recommendation_engine.sql
-- Description: Recommendation cache system
-- Schema: portal
-- ============================================

CREATE TABLE IF NOT EXISTS portal.resource_scores (
    score_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL REFERENCES portal.users(user_id) ON DELETE CASCADE,
    resource_id INT NOT NULL REFERENCES portal.resources(resource_id) ON DELETE CASCADE,
    score NUMERIC(6,2) NOT NULL,
    reason TEXT,
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, resource_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_resource_scores_user 
ON portal.resource_scores(user_id);

CREATE INDEX IF NOT EXISTS idx_resource_scores_score 
ON portal.resource_scores(score DESC);
