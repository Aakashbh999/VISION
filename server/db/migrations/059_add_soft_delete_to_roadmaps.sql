-- Add deleted_at for soft deletion of roadmaps and steps
ALTER TABLE "portal"."roadmaps" ADD COLUMN "deleted_at" timestamp with time zone;
ALTER TABLE "portal"."roadmap_steps" ADD COLUMN "deleted_at" timestamp with time zone;
