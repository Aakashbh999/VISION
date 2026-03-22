-- Migration 021: Transform IT Clubs to Directory Model
-- Adds social/website links and full description for professional directory

-- Add new columns for external connectivity
ALTER TABLE portal.it_clubs 
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS discord_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS description_full TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS founded_year INTEGER;

-- Add index for search performance
CREATE INDEX IF NOT EXISTS idx_it_clubs_name ON portal.it_clubs USING gin(to_tsvector('english', club_name));
CREATE INDEX IF NOT EXISTS idx_it_clubs_specialty ON portal.it_clubs(specialty);

-- Note: it_club_members table is deprecated but kept for data preservation
-- It will no longer be used as membership is handled externally

DO $$ BEGIN RAISE NOTICE 'IT Clubs directory model migration completed'; END $$;
