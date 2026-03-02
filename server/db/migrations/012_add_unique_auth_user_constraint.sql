-- Migration: Add unique constraint on portal.users.auth_user_id
-- This prevents duplicate portal accounts for the same auth user

-- Only add if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_auth_user' 
    AND conrelid = 'portal.users'::regclass
  ) THEN
    ALTER TABLE portal.users
    ADD CONSTRAINT unique_auth_user UNIQUE (auth_user_id);
  END IF;
END $$;
