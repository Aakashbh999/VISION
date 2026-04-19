-- Migration 067: Fix User Deletion Foreign Key Constraints
-- Drop existing constraints that block deletion and re-add them with ON DELETE rules

BEGIN;

-- 1. Fix portal.reports (reporter_user_id)
-- First drop the existing constraint
ALTER TABLE portal.reports DROP CONSTRAINT IF EXISTS fk_reporter;

-- Re-add with ON DELETE CASCADE
ALTER TABLE portal.reports 
ADD CONSTRAINT fk_reporter 
FOREIGN KEY (reporter_user_id) REFERENCES portal.users(user_id) 
ON DELETE CASCADE;


-- 2. Fix portal.moderation_logs (admin_user_id)
-- First drop the existing constraint
ALTER TABLE portal.moderation_logs DROP CONSTRAINT IF EXISTS fk_admin;

-- Re-add with ON DELETE SET NULL
ALTER TABLE portal.moderation_logs 
ADD CONSTRAINT fk_admin 
FOREIGN KEY (admin_user_id) REFERENCES portal.users(user_id) 
ON DELETE SET NULL;


-- 3. Fix portal.clubs (created_by)
-- First drop the existing constraint
ALTER TABLE portal.clubs DROP CONSTRAINT IF EXISTS clubs_created_by_fkey;

-- Re-add with ON DELETE SET NULL
ALTER TABLE portal.clubs 
ADD CONSTRAINT clubs_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES portal.users(user_id) 
ON DELETE SET NULL;

COMMIT;
