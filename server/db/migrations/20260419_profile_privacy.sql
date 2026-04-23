-- Migration: Add hide_member_since to portal.users
BEGIN;

ALTER TABLE portal.users ADD COLUMN IF NOT EXISTS hide_member_since BOOLEAN DEFAULT FALSE;

COMMIT;
