CREATE TABLE "portal"."roadmaps" (
    "roadmap_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "title" varchar(150) NOT NULL,
    "slug" varchar(150) NOT NULL UNIQUE,
    "description" text,
    "difficulty_level" varchar(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    "estimated_duration" varchar(50),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- FIXED: Removed UNIQUE from individual columns to allow multiple steps per roadmap
CREATE TABLE "portal"."roadmap_steps" (
    "step_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "roadmap_id" integer NOT NULL REFERENCES "portal"."roadmaps"("roadmap_id") ON DELETE CASCADE,
    "title" varchar(150) NOT NULL,
    "description" text,
    "step_order" integer NOT NULL,
    "estimated_time" varchar(50),
    "prerequisite_step_id" integer REFERENCES "portal"."roadmap_steps"("step_id") ON DELETE SET NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_roadmap_step_order" UNIQUE("roadmap_id", "step_order")
);

-- FIXED: Removed individual UNIQUE to allow one user to have many steps
CREATE TABLE "portal"."user_roadmap_progress" (
    "progress_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "user_id" integer NOT NULL REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    "step_id" integer NOT NULL REFERENCES "portal"."roadmap_steps"("step_id") ON DELETE CASCADE,
    "is_completed" boolean DEFAULT false,
    "completed_at" timestamp with time zone,
    CONSTRAINT "unique_user_step_progress" UNIQUE("user_id", "step_id")
);