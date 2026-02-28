CREATE TABLE "portal"."discussions" (
    "discussion_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "user_id" integer REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    "program_id" integer REFERENCES "portal"."programs"("program_id") ON DELETE SET NULL,
    "title" varchar(255) NOT NULL,
    "content" text NOT NULL,
    "like_count" integer DEFAULT 0,
    "is_deleted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "portal"."discussion_replies" (
    "reply_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "discussion_id" integer REFERENCES "portal"."discussions"("discussion_id") ON DELETE CASCADE,
    "user_id" integer REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    "content" text NOT NULL,
    "is_deleted" boolean DEFAULT false, -- Added for Soft Delete
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "portal"."discussion_likes" (
    "user_id" integer REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    "discussion_id" integer REFERENCES "portal"."discussions"("discussion_id") ON DELETE CASCADE,
    PRIMARY KEY("user_id", "discussion_id")
);

CREATE TABLE "portal"."user_follows" (
    "follower_id" integer REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    "following_id" integer REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    PRIMARY KEY("follower_id", "following_id")
);