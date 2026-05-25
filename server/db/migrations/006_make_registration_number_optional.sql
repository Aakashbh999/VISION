SET client_min_messages TO WARNING;

-- Allow first-year students to register without a TU registration number.
ALTER TABLE ONLY portal.users
  ALTER COLUMN tu_registration_no DROP NOT NULL;
