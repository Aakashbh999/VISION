-- Migration: Rename student_id_image_url to academic_certificate_url
-- Date: 2026-04-19

ALTER TABLE "portal"."users" RENAME COLUMN "student_id_image_url" TO "academic_certificate_url";
