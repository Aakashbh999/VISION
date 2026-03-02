-- Migration: Create IT reference tables in portal schema
-- These tables contain static reference data for IT fields, degrees, job market, and clubs

-- 1. IT FIELDS - Career paths in IT
CREATE TABLE IF NOT EXISTS "portal"."it_fields" (
    "id" SERIAL PRIMARY KEY,
    "slug" TEXT UNIQUE,
    "field_name" TEXT,
    "short_description" TEXT,
    "description_full" TEXT,
    "tech_stack_hint" TEXT,
    "demand_level" TEXT,
    "icon_name" TEXT,
    "is_public" BOOLEAN DEFAULT true
);

-- 2. ACADEMIC DEGREES - IT-related degree programs
CREATE TABLE IF NOT EXISTS "portal"."academic_degrees" (
    "id" SERIAL PRIMARY KEY,
    "slug" TEXT UNIQUE,
    "degree_code" TEXT,
    "full_name" TEXT,
    "university" TEXT,
    "duration" TEXT,
    "eligibility" TEXT,
    "focus_area" TEXT,
    "admission_process" TEXT,
    "is_public" BOOLEAN DEFAULT true
);

-- 3. JOB MARKET INSIGHTS - Job roles and salary data
CREATE TABLE IF NOT EXISTS "portal"."job_market_insights" (
    "id" SERIAL PRIMARY KEY,
    "slug" TEXT UNIQUE,
    "role_name" TEXT,
    "salary_range" TEXT,
    "market_demand" TEXT,
    "key_skills" TEXT,
    "job_summary" TEXT,
    "description" TEXT,
    "is_public" BOOLEAN DEFAULT true
);

-- 4. IT CLUBS - Tech clubs and organizations
CREATE TABLE IF NOT EXISTS "portal"."it_clubs" (
    "id" SERIAL PRIMARY KEY,
    "slug" TEXT UNIQUE,
    "club_name" TEXT,
    "location" TEXT,
    "institution" TEXT,
    "specialty" TEXT,
    "is_public" BOOLEAN DEFAULT true,
    "contact_info" TEXT
);

-- 5. IT CLUB MEMBERS - Membership tracking for it_clubs
CREATE TABLE IF NOT EXISTS "portal"."it_club_members" (
    "club_id" INTEGER NOT NULL REFERENCES "portal"."it_clubs"("id") ON DELETE CASCADE,
    "user_id" INTEGER NOT NULL REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    PRIMARY KEY ("club_id", "user_id")
);

-- Add is_public column to existing tables if they don't have it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'it_fields' AND column_name = 'is_public') THEN
        ALTER TABLE portal.it_fields ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'academic_degrees' AND column_name = 'is_public') THEN
        ALTER TABLE portal.academic_degrees ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'portal' AND table_name = 'job_market_insights' AND column_name = 'is_public') THEN
        ALTER TABLE portal.job_market_insights ADD COLUMN is_public BOOLEAN DEFAULT true;
    END IF;
END $$;
