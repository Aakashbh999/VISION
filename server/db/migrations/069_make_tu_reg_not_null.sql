-- Migration: Make tu_registration_no NOT NULL
-- Date: 2026-05-02

ALTER TABLE "portal"."users" ALTER COLUMN "tu_registration_no" SET NOT NULL;
