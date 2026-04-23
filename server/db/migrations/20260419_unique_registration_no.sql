-- Migration: Add UNIQUE constraint to tu_registration_no
-- Date: 2026-04-19

-- First, ensure there are no duplicate values before adding the constraint
-- (Optional cleanup could go here if we were sure about duplicates)

-- Add the unique constraint
ALTER TABLE "portal"."users" ADD CONSTRAINT "unique_tu_registration_no" UNIQUE ("tu_registration_no");
