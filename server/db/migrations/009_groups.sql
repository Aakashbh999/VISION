CREATE TABLE "portal"."it_clubs" (
    "id" serial PRIMARY KEY,
    "slug" text UNIQUE,
    "club_name" text,
    "location" text,
    "institution" text,
    "specialty" text,
    "is_public" text,
    "contact_info" text
);

CREATE TABLE "portal"."study_groups" (
    "group_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name" varchar(150) NOT NULL,
    "description" text,
    "created_by" integer REFERENCES "portal"."users"("user_id") ON DELETE SET NULL,
    "program_id" integer REFERENCES "portal"."programs"("program_id") ON DELETE SET NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "portal"."group_members" (
    "group_id" integer REFERENCES "portal"."study_groups"("group_id") ON DELETE CASCADE,
    "user_id" integer REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    PRIMARY KEY("group_id", "user_id")
);