-- Migration to change date_of_birth from DATE to VARCHAR(10) to support B.S. dates
-- which may contain days exceeding Gregorian month limits (e.g., 2080-02-30)

-- We need to change both portal.users and portal.registration_no tables

BEGIN;

-- For portal.users
ALTER TABLE "portal"."users" 
  ALTER COLUMN "date_of_birth" TYPE VARCHAR(10) 
  USING TO_CHAR("date_of_birth", 'YYYY-MM-DD');

-- For portal.registration_no
-- First drop the index that depends on the column, then alter, then recreate.
DROP INDEX IF EXISTS "portal"."idx_registration_no_lookup";

ALTER TABLE "portal"."registration_no" 
  ALTER COLUMN "date_of_birth" TYPE VARCHAR(10) 
  USING TO_CHAR("date_of_birth", 'YYYY-MM-DD');

-- Recreate index for registration_no
CREATE INDEX "idx_registration_no_lookup" ON "portal"."registration_no" ("registration_number", "batch_year", "date_of_birth");

COMMIT;
