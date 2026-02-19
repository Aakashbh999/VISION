-- Track every resource interaction
CREATE TABLE IF NOT EXISTS portal.user_resource_interactions (
    interaction_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,
    resource_id INT REFERENCES portal.resources(resource_id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) CHECK (interaction_type IN ('view','complete','bookmark')),
    interacted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Optional: store computed interest weights (cached profile)
CREATE TABLE IF NOT EXISTS portal.user_tag_profile (
    user_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,
    tag_id INT REFERENCES portal.tags(tag_id) ON DELETE CASCADE,
    weight FLOAT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id, tag_id)
);
