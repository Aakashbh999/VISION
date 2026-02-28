CREATE TABLE "portal"."tags" (
    "tag_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "tag_name" varchar(100) NOT NULL UNIQUE
);

CREATE TABLE "portal"."user_interests" (
    "user_id" integer REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    "tag_id" integer REFERENCES "portal"."tags"("tag_id") ON DELETE CASCADE,
    PRIMARY KEY("user_id", "tag_id")
);

CREATE TABLE "portal"."user_tag_profile" (
    "user_id" integer REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    "tag_id" integer REFERENCES "portal"."tags"("tag_id") ON DELETE CASCADE,
    "weight" double precision DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY("user_id", "tag_id")
);