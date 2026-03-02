CREATE TABLE "portal"."notifications" (
    "notification_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "user_id" integer REFERENCES "portal"."users"("user_id") ON DELETE CASCADE,
    "title" varchar(150),
    "message" text NOT NULL,
    "type" varchar(40),
    "is_read" boolean DEFAULT false,
    "actor_user_id" integer REFERENCES "portal"."users"("user_id") ON DELETE SET NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "portal"."reports" (
    "report_id" serial PRIMARY KEY,
    "reporter_user_id" integer REFERENCES "portal"."users"("user_id"),
    "target_type" varchar(50),
    "target_id" integer,
    "reason" text,
    "status" varchar(30) DEFAULT 'open',
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "portal"."moderation_logs" (
    "log_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "admin_user_id" integer REFERENCES "portal"."users"("user_id") ON DELETE SET NULL,
    "action_type" varchar(50),
    "target_type" varchar(50),
    "target_id" integer,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);