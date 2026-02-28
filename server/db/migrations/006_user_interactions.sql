CREATE TABLE "portal"."user_resource_interactions" (
    "interaction_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "user_id" integer NOT NULL REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    "resource_id" integer NOT NULL, -- FK added in file 008 after resources created
    "interaction_type" varchar(20) NOT NULL CHECK (interaction_type IN ('view', 'click', 'bookmark', 'complete', 'like', 'dislike')),
    "interaction_value" smallint DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_user_resource_action" UNIQUE("user_id", "resource_id", "interaction_type")
);