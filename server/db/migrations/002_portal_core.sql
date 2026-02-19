CREATE SCHEMA IF NOT EXISTS portal;

CREATE TYPE portal.student_status_type AS ENUM ('pending_review','approved','rejected');

-- Programs
CREATE TABLE IF NOT EXISTS portal.programs (
    program_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    program_name VARCHAR(100) UNIQUE NOT NULL
);

-- Students
CREATE TABLE IF NOT EXISTS portal.users (
    user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auth_user_id INT UNIQUE REFERENCES auth.users(auth_user_id) ON DELETE CASCADE,
    full_name VARCHAR(120) NOT NULL,
    university VARCHAR(100),
    campus VARCHAR(150),
    program_id INT REFERENCES portal.programs(program_id),
    semester INT,
    tu_registration_no VARCHAR(50),
    student_id_image_url TEXT,
    student_status portal.student_status_type DEFAULT 'pending_review',
    verified_by_admin_id INT REFERENCES portal.users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tags (skills/topics)
CREATE TABLE IF NOT EXISTS portal.tags (
    tag_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag_name VARCHAR(50) UNIQUE NOT NULL
);

-- Resources (global learning content)
CREATE TABLE IF NOT EXISTS portal.resources (
    resource_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    resource_type VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Resource tagging
CREATE TABLE IF NOT EXISTS portal.resource_tags (
    resource_id INT REFERENCES portal.resources(resource_id) ON DELETE CASCADE,
    tag_id INT REFERENCES portal.tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY(resource_id, tag_id)
);

-- User interests (manual selection)
CREATE TABLE IF NOT EXISTS portal.user_interests (
    user_id INT REFERENCES portal.users(user_id) ON DELETE CASCADE,
    tag_id INT REFERENCES portal.tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, tag_id)
);
