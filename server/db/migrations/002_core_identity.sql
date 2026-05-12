        UPDATE portal.users

CREATE TABLE auth.users (
    auth_user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    email_status auth.email_status_type DEFAULT 'pending'::auth.email_status_type,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp with time zone,
    role auth.user_role_type DEFAULT 'student'::auth.user_role_type
);

ALTER TABLE auth.users ALTER COLUMN auth_user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.users_auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.activity_feed (
    activity_id integer NOT NULL,
    actor_user_id integer,
    action_type character varying(50) NOT NULL,
    reference_type character varying(40),
    reference_id integer,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE portal.activity_feed ALTER COLUMN activity_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.activity_feed_activity_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.campuses (
    campus_id integer NOT NULL,
    campus_name character varying(255) NOT NULL,
    affiliated_university character varying(255),
    location character varying(255),
    contact_email character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE portal.campuses_campus_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.campuses_campus_id_seq OWNED BY portal.campuses.campus_id;

CREATE TABLE portal.moderation_logs (
    log_id integer NOT NULL,
    admin_user_id integer,
    action_type character varying(50),
    target_type character varying(50),
    target_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE portal.moderation_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.moderation_logs_log_id_seq OWNED BY portal.moderation_logs.log_id;

COMMENT ON TABLE portal.resources IS 'Learning resources with difficulty levels, linked to programs and roadmap steps';

CREATE TABLE portal.programs (
    program_id integer NOT NULL,
    program_name character varying(100) NOT NULL
);

ALTER TABLE portal.programs ALTER COLUMN program_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.programs_program_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.registration_no (
    registration_number character varying(50) NOT NULL,
    student_name character varying(100) NOT NULL,
    date_of_birth character varying(10) NOT NULL,
    batch_year integer NOT NULL,
    program character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portal.users (
    user_id integer NOT NULL,
    auth_user_id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    university character varying(100) DEFAULT 'TU'::character varying,
    campus character varying(150),
    program_id integer,
    semester integer,
    tu_registration_no character varying(50) NOT NULL,
    academic_certificate_url text,
    student_status portal.student_status_type DEFAULT 'pending_review'::portal.student_status_type,
    verified_by_admin_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_suspended boolean DEFAULT false,
    profile_image text,
    profile_image_public_id text,
    cover_image text,
    cover_image_public_id text,
    is_verified boolean DEFAULT false,
    reset_password_token text,
    reset_password_expires timestamp without time zone,
    role character varying(20) DEFAULT 'student'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    updated_at timestamp without time zone DEFAULT now(),
    it_field_id integer,
    academic_degree_id integer,
    reputation_points integer DEFAULT 0,
    is_moderator boolean DEFAULT false NOT NULL,
    bio text,
    banner_image text,
    banner_image_public_id text,
    last_profile_pic_update timestamp with time zone,
    last_banner_update timestamp with time zone,
    profile_pic_free_skips integer DEFAULT 3 NOT NULL,
    banner_free_skips integer DEFAULT 3 NOT NULL,
    batch_year integer,
    semester_is_manual boolean DEFAULT false NOT NULL,
    linkedin_url text,
    facebook_url text,
    instagram_url text,
    youtube_url text,
    reddit_url text,
    twitter_url text,
    github_url text,
    website_url text,
    current_education text,
    target_exam text,
    career_scope text,
    registration_step integer DEFAULT 1,
    last_seen_at timestamp with time zone,
    date_of_birth character varying(10),
    campus_id integer,
    hide_member_since boolean DEFAULT false,
    rejection_reason text
);

COMMENT ON COLUMN portal.users.career_scope IS 'Industry-ready tags as a comma-separated string or JSON array.';

ALTER TABLE portal.users ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY portal.campuses ALTER COLUMN campus_id SET DEFAULT nextval('portal.campuses_campus_id_seq'::regclass);

ALTER TABLE ONLY portal.moderation_logs ALTER COLUMN log_id SET DEFAULT nextval('portal.moderation_logs_log_id_seq'::regclass);

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (auth_user_id);

ALTER TABLE ONLY portal.activity_feed
    ADD CONSTRAINT activity_feed_pkey PRIMARY KEY (activity_id);

ALTER TABLE ONLY portal.campuses
    ADD CONSTRAINT campuses_campus_name_key UNIQUE (campus_name);

ALTER TABLE ONLY portal.campuses
    ADD CONSTRAINT campuses_pkey PRIMARY KEY (campus_id);

ALTER TABLE ONLY portal.moderation_logs
    ADD CONSTRAINT moderation_logs_pkey PRIMARY KEY (log_id);

ALTER TABLE ONLY portal.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (program_id);

ALTER TABLE ONLY portal.programs
    ADD CONSTRAINT programs_program_name_key UNIQUE (program_name);

ALTER TABLE ONLY portal.registration_no
    ADD CONSTRAINT registration_no_pkey PRIMARY KEY (registration_number);

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT unique_auth_user UNIQUE (auth_user_id);

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT unique_tu_registration_no UNIQUE (tu_registration_no);

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_auth_user_id_key UNIQUE (auth_user_id);

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);

CREATE INDEX idx_auth_users_email ON auth.users USING btree (email);

CREATE INDEX idx_activity_created ON portal.activity_feed USING btree (created_at DESC);

CREATE INDEX idx_activity_feed_action_type ON portal.activity_feed USING btree (action_type);

CREATE INDEX idx_activity_feed_created_action ON portal.activity_feed USING btree (created_at DESC, action_type);

CREATE INDEX idx_activity_user ON portal.activity_feed USING btree (actor_user_id);

CREATE INDEX idx_moderation_target ON portal.moderation_logs USING btree (target_type, target_id);

CREATE INDEX idx_portal_users_last_seen_at ON portal.users USING btree (last_seen_at);

CREATE INDEX idx_registration_no_lookup ON portal.registration_no USING btree (registration_number, batch_year, date_of_birth);

CREATE INDEX idx_users_moderator ON portal.users USING btree (is_moderator) WHERE (is_moderator = true);

CREATE INDEX idx_users_reputation ON portal.users USING btree (reputation_points DESC NULLS LAST);

ALTER TABLE ONLY auth.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(auth_user_id) ON DELETE CASCADE;

ALTER TABLE ONLY auth.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(auth_user_id) ON DELETE CASCADE;

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(auth_user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.activity_feed
    ADD CONSTRAINT activity_feed_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.club_members
    ADD CONSTRAINT club_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.clubs
    ADD CONSTRAINT clubs_created_by_fkey FOREIGN KEY (created_by) REFERENCES portal.users(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.comment_likes
    ADD CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.discussion_comments
    ADD CONSTRAINT discussion_comments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES portal.users(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.discussion_likes
    ADD CONSTRAINT discussion_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.discussion_comments
    ADD CONSTRAINT discussion_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.discussions
    ADD CONSTRAINT discussions_program_id_fkey FOREIGN KEY (program_id) REFERENCES portal.programs(program_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.discussions
    ADD CONSTRAINT discussions_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.moderation_logs
    ADD CONSTRAINT fk_admin FOREIGN KEY (admin_user_id) REFERENCES portal.users(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT fk_auth_user FOREIGN KEY (auth_user_id) REFERENCES auth.users(auth_user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.reports
    ADD CONSTRAINT fk_reporter FOREIGN KEY (reporter_user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.group_invitations
    ADD CONSTRAINT group_invitations_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.group_invitations
    ADD CONSTRAINT group_invitations_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.group_members
    ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.group_posts
    ADD CONSTRAINT group_posts_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES portal.users(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.group_posts
    ADD CONSTRAINT group_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.study_groups
    ADD CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES portal.users(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.study_groups
    ADD CONSTRAINT groups_program_id_fkey FOREIGN KEY (program_id) REFERENCES portal.programs(program_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.join_requests
    ADD CONSTRAINT join_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.mentorship_requests
    ADD CONSTRAINT mentorship_requests_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.mentorship_requests
    ADD CONSTRAINT mentorship_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.notifications
    ADD CONSTRAINT notifications_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES portal.users(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.program_roadmaps
    ADD CONSTRAINT program_roadmaps_program_id_fkey FOREIGN KEY (program_id) REFERENCES portal.programs(program_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.resource_scores
    ADD CONSTRAINT resource_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.resources
    ADD CONSTRAINT resources_created_by_fkey FOREIGN KEY (created_by) REFERENCES portal.users(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.resources
    ADD CONSTRAINT resources_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES portal.users(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.resources
    ADD CONSTRAINT resources_program_id_fkey FOREIGN KEY (program_id) REFERENCES portal.programs(program_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.saved_discussions
    ADD CONSTRAINT saved_discussions_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.study_groups
    ADD CONSTRAINT study_groups_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES portal.users(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.user_badges
    ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_followers
    ADD CONSTRAINT user_followers_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_followers
    ADD CONSTRAINT user_followers_following_id_fkey FOREIGN KEY (following_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_follows
    ADD CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_follows
    ADD CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_goals
    ADD CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_interests
    ADD CONSTRAINT user_interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_resource_interactions
    ADD CONSTRAINT user_resource_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_roadmap_enrolments
    ADD CONSTRAINT user_roadmap_enrolments_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_roadmap_progress
    ADD CONSTRAINT user_roadmap_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_skills
    ADD CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_stats
    ADD CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_streaks
    ADD CONSTRAINT user_streaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_tag_profile
    ADD CONSTRAINT user_tag_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_academic_degree_id_fkey FOREIGN KEY (academic_degree_id) REFERENCES portal.academic_degrees(id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(auth_user_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_campus_id_fkey FOREIGN KEY (campus_id) REFERENCES portal.campuses(campus_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_it_field_id_fkey FOREIGN KEY (it_field_id) REFERENCES portal.it_fields(id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_program_id_fkey FOREIGN KEY (program_id) REFERENCES portal.programs(program_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_verified_by_admin_id_fkey FOREIGN KEY (verified_by_admin_id) REFERENCES portal.users(user_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.xp_activity_log
    ADD CONSTRAINT xp_activity_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;