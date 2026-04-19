-- Migration to add registration_no table for automated approval whitelist
CREATE TABLE "portal"."registration_no" (
    "registration_number" varchar(50) PRIMARY KEY,
    "student_name" varchar(100) NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "batch_year" integer NOT NULL,
    "program" varchar(100) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups during registration
CREATE INDEX idx_registration_no_lookup ON "portal"."registration_no" (registration_number, batch_year, date_of_birth);
