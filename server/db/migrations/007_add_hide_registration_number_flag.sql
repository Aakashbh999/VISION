SET client_min_messages TO WARNING;

-- Add profile privacy toggle for showing/hiding registration number.
ALTER TABLE ONLY portal.users
  ADD COLUMN IF NOT EXISTS hide_registration_number boolean NOT NULL DEFAULT FALSE;
