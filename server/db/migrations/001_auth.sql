CREATE SCHEMA IF NOT EXISTS "auth";

CREATE TYPE "auth"."email_status_type" AS ENUM('pending', 'verified');
CREATE TYPE "auth"."user_role_type" AS ENUM('student', 'admin');

CREATE TABLE "auth"."users" (
    "auth_user_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "email" varchar(255) NOT NULL UNIQUE,
    "password_hash" text NOT NULL,
    "email_status" "auth"."email_status_type" DEFAULT 'pending',
    "role" "auth"."user_role_type" DEFAULT 'student',
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "last_login" timestamp with time zone
);

CREATE TABLE "auth"."email_verification_tokens" (
    "token_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "auth_user_id" integer NOT NULL REFERENCES "auth"."users"("auth_user_id") ON DELETE CASCADE,
    "token" varchar(255) NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "auth"."password_reset_tokens" (
    "token_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "auth_user_id" integer NOT NULL REFERENCES "auth"."users"("auth_user_id") ON DELETE CASCADE,
    "token" varchar(255) NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);