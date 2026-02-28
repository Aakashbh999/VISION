CREATE SCHEMA IF NOT EXISTS "portal";

CREATE TYPE "portal"."student_status_type" AS ENUM('pending_review', 'approved', 'rejected');

CREATE TABLE "portal"."programs" (
    "program_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "program_name" varchar(100) NOT NULL UNIQUE
);

CREATE TABLE "portal"."users" (
    "user_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "auth_user_id" integer NOT NULL UNIQUE REFERENCES "auth"."users"("auth_user_id") ON DELETE CASCADE,
    "full_name" varchar(100) NOT NULL,
    "university" varchar(100) DEFAULT 'TU',
    "campus" varchar(150),
    "program_id" integer REFERENCES "portal"."programs"("program_id") ON DELETE SET NULL,
    "semester" integer,
    "tu_registration_no" varchar(50),
    "student_id_image_url" text,
    "student_status" "portal"."student_status_type" DEFAULT 'pending_review',
    "verified_by_admin_id" integer REFERENCES "portal"."users"("user_id") ON DELETE SET NULL,
    "is_suspended" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);