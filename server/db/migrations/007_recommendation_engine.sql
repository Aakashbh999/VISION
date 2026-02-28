-- FIXED: Removed individual UNIQUE so a user can score many different resources
CREATE TABLE "portal"."resource_scores" (
    "score_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "user_id" integer NOT NULL REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    "resource_id" integer NOT NULL, -- FK added in file 008 after resources created
    "score" numeric(6, 2) NOT NULL,
    "reason" text,
    "calculated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_user_resource_score" UNIQUE("user_id", "resource_id")
);