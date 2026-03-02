-- Migration: Password Reset Tokens Table
-- NOTE: This table is already created in 001_auth.sql with the correct schema
-- This file is kept for reference but should NOT be run
-- 
-- The correct schema (already in DB):
-- CREATE TABLE auth.password_reset_tokens (
--     token_id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
--     auth_user_id integer NOT NULL REFERENCES auth.users(auth_user_id) ON DELETE CASCADE,
--     token varchar(255) NOT NULL,
--     expires_at timestamp with time zone NOT NULL,
--     created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
-- );

-- Skip this migration - table already exists
SELECT 'Skipping: password_reset_tokens already created in 001_auth.sql' AS message;
