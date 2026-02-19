CREATE SCHEMA IF NOT EXISTS auth;

CREATE TYPE auth.email_status_type AS ENUM ('pending', 'verified');

CREATE TABLE IF NOT EXISTS auth.users (
    auth_user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_status auth.email_status_type DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS auth.email_verification_tokens (
    token_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auth_user_id INT REFERENCES auth.users(auth_user_id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
