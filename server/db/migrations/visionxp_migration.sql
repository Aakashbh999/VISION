-- Create user_stats table in portal schema
CREATE TABLE IF NOT EXISTS portal.user_stats (
    user_id INTEGER PRIMARY KEY REFERENCES portal.users(user_id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    roadmaps_completed INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize user_stats for existing users
INSERT INTO portal.user_stats (user_id)
SELECT user_id FROM portal.users
ON CONFLICT (user_id) DO NOTHING;
