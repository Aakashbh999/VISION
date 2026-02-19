-- Groups

CREATE TABLE IF NOT EXISTS portal.study_groups (
    group_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    title VARCHAR(150) NOT NULL,
    description TEXT,

    created_by INT REFERENCES portal.users(user_id) ON DELETE SET NULL,

    related_type VARCHAR(50), 
    -- 'roadmap_step', 'program', 'general'

    related_id INT,

    max_members INT DEFAULT 10,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Members

CREATE TABLE IF NOT EXISTS portal.study_group_members (
    group_id INT REFERENCES portal.study_groups(group_id) ON DELETE CASCADE,
    user_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,

    role VARCHAR(20) DEFAULT 'member', -- owner, member
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (group_id, user_id)
);

-- Messages

CREATE TABLE IF NOT EXISTS portal.study_group_messages (
    message_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    group_id INT REFERENCES portal.study_groups(group_id) ON DELETE CASCADE,
    sender_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,

    message TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

