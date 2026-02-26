-- Migration: Add role column to auth.users
-- This column was referenced in the login query but was missing from the schema

DO $$
BEGIN
    -- Create the role enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth')) THEN
        CREATE TYPE auth.user_role_type AS ENUM ('student', 'admin');
    END IF;
END $$;

-- Add role column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE auth.users ADD COLUMN role auth.user_role_type DEFAULT 'student';
    END IF;
END $$;
