-- Discussions
CREATE TABLE IF NOT EXISTS portal.discussions (
    discussion_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,
    program_id INT REFERENCES portal.programs(program_id),
    title VARCHAR(200),
    content TEXT,
    like_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portal.discussion_replies (
    reply_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    discussion_id INT REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE,
    user_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portal.discussion_likes (
    user_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,
    discussion_id INT REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, discussion_id)
);

-- Follow system
CREATE TABLE IF NOT EXISTS portal.user_follows (
    follower_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,
    following_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,
    PRIMARY KEY(follower_id, following_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS portal.notifications (
    notification_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,
    message TEXT,
    type VARCHAR(40),
    title VARCHAR(150),
    related_type VARCHAR(50),
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portal.activity_feed (
    activity_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_user_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,   -- e.g., completed_step, joined_club
    reference_type VARCHAR(50),         -- roadmap_step, club, discussion
    reference_id INT,
    metadata JSONB,                     -- optional JSON for extra info
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_user
ON portal.activity_feed(actor_user_id);

CREATE INDEX IF NOT EXISTS idx_activity_created
ON portal.activity_feed(created_at DESC);
