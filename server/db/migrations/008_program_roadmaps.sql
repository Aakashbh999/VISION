CREATE TYPE "portal"."resource_type_enum" AS ENUM('notes', 'book', 'link', 'project');

CREATE TABLE "portal"."resources" (
    "resource_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "program_id" integer REFERENCES "portal"."programs"("program_id") ON DELETE SET NULL,
    "semester" integer,
    "subject_name" varchar(150),
    "title" varchar(255) NOT NULL,
    "resource_type" "portal"."resource_type_enum",
    "url" text,
    "description" text
);

CREATE TABLE "portal"."program_roadmaps" (
    "program_id" integer REFERENCES "portal"."programs"("program_id") ON DELETE CASCADE,
    "roadmap_id" integer REFERENCES "portal"."roadmaps"("roadmap_id") ON DELETE CASCADE,
    "is_primary" boolean DEFAULT false,
    PRIMARY KEY("program_id", "roadmap_id")
);

CREATE TABLE "portal"."step_resource_map" (
    "step_id" integer REFERENCES "portal"."roadmap_steps"("step_id") ON DELETE CASCADE,
    "resource_id" integer REFERENCES "portal"."resources"("resource_id") ON DELETE CASCADE,
    "is_required" boolean DEFAULT true,
    PRIMARY KEY("step_id", "resource_id")
);

-- Add missing Foreign Keys to interaction tables now that resources exist
ALTER TABLE "portal"."user_resource_interactions" ADD CONSTRAINT "fk_res_interact" FOREIGN KEY ("resource_id") REFERENCES "portal"."resources"("resource_id") ON DELETE CASCADE;
ALTER TABLE "portal"."resource_scores" ADD CONSTRAINT "fk_res_score" FOREIGN KEY ("resource_id") REFERENCES "portal"."resources"("resource_id") ON DELETE CASCADE;