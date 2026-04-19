-- Migration 068: Create Campuses Table and Relational Link

BEGIN;

CREATE TABLE IF NOT EXISTS portal.campuses (
    campus_id SERIAL PRIMARY KEY,
    campus_name VARCHAR(255) NOT NULL UNIQUE,
    affiliated_university VARCHAR(255),
    location VARCHAR(255),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add campus_id to portal.users as a foreign key
ALTER TABLE portal.users ADD COLUMN campus_id INTEGER REFERENCES portal.campuses(campus_id) ON DELETE SET NULL;

COMMIT;
