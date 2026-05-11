
\restrict YcliiuhKIU3ybeBjgCOrrj5dRjiHZlCKTBQkjSlYLai4WKYzIcSYUQHOnQedvpb

DECLARE

    target_user_id INTEGER;

    delta INTEGER := 0;

BEGIN

    IF (TG_OP = 'INSERT') THEN

        IF NEW.vote_type = 1 THEN

            delta := 5;

        END IF;

    ELSIF (TG_OP = 'DELETE') THEN

        IF OLD.vote_type = 1 THEN

            delta := -5;

        END IF;

    ELSIF (TG_OP = 'UPDATE') THEN

        IF OLD.vote_type = 1 AND NEW.vote_type <> 1 THEN

            delta := -5;

        ELSIF OLD.vote_type <> 1 AND NEW.vote_type = 1 THEN

            delta := 5;

        END IF;

    END IF;

    IF target_user_id IS NOT NULL AND delta <> 0 THEN

        SET reputation_points = GREATEST(0, COALESCE(reputation_points, 0) + delta)

        WHERE user_id = target_user_id;

    END IF;

    RETURN NULL;

END;

$$;

BEGIN

    IF TG_OP = 'INSERT' THEN

        IF NEW.is_deleted IS DISTINCT FROM true THEN

               SET comment_count = COALESCE(comment_count, 0) + 1

             WHERE discussion_id = NEW.discussion_id;

        END IF;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN

        IF OLD.is_deleted IS DISTINCT FROM true THEN

               SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)

             WHERE discussion_id = OLD.discussion_id;

        END IF;

        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN

        IF OLD.is_deleted IS DISTINCT FROM true

           AND NEW.is_deleted = true THEN

               SET comment_count = GREATEST(COALESCE(comment_count, 0) - 1, 0)

             WHERE discussion_id = NEW.discussion_id;

        ELSIF OLD.is_deleted = true

              AND NEW.is_deleted IS DISTINCT FROM true THEN

               SET comment_count = COALESCE(comment_count, 0) + 1

             WHERE discussion_id = NEW.discussion_id;

        END IF;

        RETURN NEW;

    END IF;

    RETURN NULL;

END;

$$;

BEGIN

    IF TG_OP = 'INSERT' THEN

           SET like_count = COALESCE(like_count, 0) + 1

         WHERE discussion_id = NEW.discussion_id;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN

           SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)

         WHERE discussion_id = OLD.discussion_id;

        RETURN OLD;

    END IF;

    RETURN NULL;

END;

$$;

CREATE TABLE auth.email_verification_tokens (
    token_id integer NOT NULL,
    auth_user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE auth.email_verification_tokens ALTER COLUMN token_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.email_verification_tokens_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE auth.password_reset_tokens (
    token_id integer NOT NULL,
    auth_user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    token_hash character varying(255)
);

ALTER TABLE auth.password_reset_tokens ALTER COLUMN token_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.password_reset_tokens_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE auth.refresh_tokens (
    id integer NOT NULL,
    auth_user_id integer NOT NULL,
    token_hash character varying(255) NOT NULL,
    device_id character varying(64),
    device_info jsonb,
    ip_address character varying(45),
    user_agent text,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_used_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE auth.refresh_tokens ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.academic_degrees (
    id integer NOT NULL,
    slug text,
    degree_code text,
    full_name text,
    university text,
    duration text,
    eligibility jsonb,
    focus_area text,
    admission_process text,
    is_public boolean DEFAULT true
);

CREATE SEQUENCE portal.academic_degrees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.academic_degrees_id_seq OWNED BY portal.academic_degrees.id;

CREATE TABLE portal.it_fields (
    id integer NOT NULL,
    slug text,
    field_name text,
    short_description text,
    description_full text,
    tech_stack_hint text,
    demand_level text,
    icon_name text,
    average_salary integer,
    growth_rate numeric(5,2),
    job_count integer DEFAULT 0,
    is_public boolean DEFAULT true
);

CREATE SEQUENCE portal.it_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.it_fields_id_seq OWNED BY portal.it_fields.id;

CREATE SEQUENCE portal.job_market_insights_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.job_market_insights_id_seq OWNED BY portal.job_market_insights.id;

CREATE TABLE portal.jobs (
    job_id integer NOT NULL,
    title character varying(200) NOT NULL,
    company character varying(150),
    location character varying(100),
    salary_min integer,
    salary_max integer,
    experience_level portal.experience_level_type DEFAULT 'entry'::portal.experience_level_type,
    field_id integer,
    description text,
    requirements text,
    is_remote boolean DEFAULT false,
    source character varying(100),
    posted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE portal.jobs_job_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.jobs_job_id_seq OWNED BY portal.jobs.job_id;

CREATE TABLE portal.mentorship_requests (
    request_id integer NOT NULL,
    mentor_id integer,
    student_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    message text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT mentorship_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'completed'::character varying])::text[])))
);

ALTER TABLE portal.mentorship_requests ALTER COLUMN request_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.mentorship_requests_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.notifications (
    notification_id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    related_type character varying(50),
    related_id integer,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    type character varying(40),
    title character varying(150),
    actor_user_id integer,
    reference_id integer,
    reference_type character varying(50)
);

ALTER TABLE portal.notifications ALTER COLUMN notification_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.notifications_notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.reports (
    report_id integer NOT NULL,
    reporter_user_id integer,
    target_type character varying(50),
    target_id integer,
    reason text,
    status character varying(30) DEFAULT 'open'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE portal.reports_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.reports_report_id_seq OWNED BY portal.reports.report_id;

CREATE TABLE portal.user_badges (
    user_id integer NOT NULL,
    badge_name character varying(50) NOT NULL,
    earned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    badge_id integer NOT NULL,
    badge_category character varying,
    badge_icon character varying
);

COMMENT ON TABLE portal.user_badges IS 'Badge definitions:
  MILESTONE: level_5, level_10, level_25, level_50
  STREAK: streak_7_days, streak_30_days, streak_100_days
  LEARNING: first_resource_uploaded, first_goal_completed, subject_expert
  SOCIAL: first_comment, community_helper, discussion_leader';

CREATE SEQUENCE portal.user_badges_badge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.user_badges_badge_id_seq OWNED BY portal.user_badges.badge_id;

CREATE SEQUENCE portal.user_goals_goal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.user_goals_goal_id_seq OWNED BY portal.user_goals.goal_id;

CREATE TABLE portal.user_interests (
    user_id integer NOT NULL,
    tag_id integer NOT NULL
);

CREATE TABLE portal.user_streaks (
    streak_id integer NOT NULL,
    user_id integer NOT NULL,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_activity timestamp without time zone,
    activity_type character varying DEFAULT 'any'::character varying,
    reset_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE portal.user_streaks_streak_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.user_streaks_streak_id_seq OWNED BY portal.user_streaks.streak_id;

CREATE TABLE portal.user_tag_profile (
    user_id integer NOT NULL,
    tag_id integer NOT NULL,
    weight double precision DEFAULT 0,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portal.xp_activity_log (
    log_id integer NOT NULL,
    user_id integer NOT NULL,
    amount integer NOT NULL,
    reason character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    new_total integer,
    new_level integer
);

CREATE SEQUENCE portal.xp_activity_log_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.xp_activity_log_log_id_seq OWNED BY portal.xp_activity_log.log_id;

ALTER TABLE ONLY portal.academic_degrees ALTER COLUMN id SET DEFAULT nextval('portal.academic_degrees_id_seq'::regclass);

ALTER TABLE ONLY portal.it_fields ALTER COLUMN id SET DEFAULT nextval('portal.it_fields_id_seq'::regclass);

ALTER TABLE ONLY portal.job_market_insights ALTER COLUMN id SET DEFAULT nextval('portal.job_market_insights_id_seq'::regclass);

ALTER TABLE ONLY portal.jobs ALTER COLUMN job_id SET DEFAULT nextval('portal.jobs_job_id_seq'::regclass);

ALTER TABLE ONLY portal.reports ALTER COLUMN report_id SET DEFAULT nextval('portal.reports_report_id_seq'::regclass);

ALTER TABLE ONLY portal.user_badges ALTER COLUMN badge_id SET DEFAULT nextval('portal.user_badges_badge_id_seq'::regclass);

ALTER TABLE ONLY portal.user_goals ALTER COLUMN goal_id SET DEFAULT nextval('portal.user_goals_goal_id_seq'::regclass);

ALTER TABLE ONLY portal.user_streaks ALTER COLUMN streak_id SET DEFAULT nextval('portal.user_streaks_streak_id_seq'::regclass);

ALTER TABLE ONLY portal.xp_activity_log ALTER COLUMN log_id SET DEFAULT nextval('portal.xp_activity_log_log_id_seq'::regclass);

ALTER TABLE ONLY auth.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (token_id);

ALTER TABLE ONLY auth.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (token_id);

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);

ALTER TABLE ONLY portal.academic_degrees
    ADD CONSTRAINT academic_degrees_pkey PRIMARY KEY (id);

ALTER TABLE ONLY portal.academic_degrees
    ADD CONSTRAINT academic_degrees_slug_key UNIQUE (slug);

ALTER TABLE ONLY portal.it_fields
    ADD CONSTRAINT it_fields_pkey PRIMARY KEY (id);

ALTER TABLE ONLY portal.it_fields
    ADD CONSTRAINT it_fields_slug_key UNIQUE (slug);

ALTER TABLE ONLY portal.job_market_insights
    ADD CONSTRAINT job_market_insights_pkey PRIMARY KEY (id);

ALTER TABLE ONLY portal.job_market_insights
    ADD CONSTRAINT job_market_insights_slug_key UNIQUE (slug);

ALTER TABLE ONLY portal.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (job_id);

ALTER TABLE ONLY portal.mentorship_requests
    ADD CONSTRAINT mentorship_requests_pkey PRIMARY KEY (request_id);

ALTER TABLE ONLY portal.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);

ALTER TABLE ONLY portal.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (report_id);

ALTER TABLE ONLY portal.user_badges
    ADD CONSTRAINT user_badges_pkey PRIMARY KEY (user_id, badge_name);

ALTER TABLE ONLY portal.user_goals
    ADD CONSTRAINT user_goals_pkey PRIMARY KEY (goal_id);

ALTER TABLE ONLY portal.user_interests
    ADD CONSTRAINT user_interests_pkey PRIMARY KEY (user_id, tag_id);

ALTER TABLE ONLY portal.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (user_id);

ALTER TABLE ONLY portal.user_streaks
    ADD CONSTRAINT user_streaks_pkey PRIMARY KEY (streak_id);

ALTER TABLE ONLY portal.user_streaks
    ADD CONSTRAINT user_streaks_user_id_key UNIQUE (user_id);

ALTER TABLE ONLY portal.user_tag_profile
    ADD CONSTRAINT user_tag_profile_pkey PRIMARY KEY (user_id, tag_id);

ALTER TABLE ONLY portal.xp_activity_log
    ADD CONSTRAINT xp_activity_log_pkey PRIMARY KEY (log_id);

CREATE INDEX idx_refresh_tokens_hash ON auth.refresh_tokens USING btree (token_hash) WHERE (revoked = false);

CREATE INDEX idx_refresh_tokens_user ON auth.refresh_tokens USING btree (auth_user_id);

CREATE INDEX idx_academic_degrees_eligibility ON portal.academic_degrees USING gin (eligibility);

CREATE INDEX idx_jobs_active ON portal.jobs USING btree (is_active) WHERE (is_active = true);

CREATE INDEX idx_jobs_experience ON portal.jobs USING btree (experience_level);

CREATE INDEX idx_jobs_field ON portal.jobs USING btree (field_id);

CREATE INDEX idx_jobs_posted ON portal.jobs USING btree (posted_at DESC);

CREATE INDEX idx_jobs_salary ON portal.jobs USING btree (salary_min, salary_max);

CREATE INDEX idx_notifications_user_created ON portal.notifications USING btree (user_id, created_at DESC);

CREATE INDEX idx_reports_status ON portal.reports USING btree (status);

CREATE INDEX idx_reports_status_open ON portal.reports USING btree (status) WHERE ((status)::text = 'open'::text);

CREATE INDEX idx_reports_target ON portal.reports USING btree (target_type, target_id);

CREATE INDEX idx_user_badges_category ON portal.user_badges USING btree (badge_category);

CREATE INDEX idx_user_badges_user ON portal.user_badges USING btree (user_id);

CREATE INDEX idx_user_goals_status ON portal.user_goals USING btree (status);

CREATE INDEX idx_user_goals_user_deadline ON portal.user_goals USING btree (user_id, deadline);

CREATE INDEX idx_user_interests_user ON portal.user_interests USING btree (user_id);

CREATE INDEX idx_user_stats_streak ON portal.user_stats USING btree (current_streak DESC);

CREATE INDEX idx_user_streaks_last_activity ON portal.user_streaks USING btree (last_activity DESC);

CREATE INDEX idx_xp_activity_log_created_at ON portal.xp_activity_log USING btree (created_at DESC);

CREATE INDEX idx_xp_activity_log_user_id ON portal.xp_activity_log USING btree (user_id);

CREATE INDEX idx_xp_log_created ON portal.xp_activity_log USING btree (created_at DESC);

CREATE INDEX idx_xp_log_user_recent ON portal.xp_activity_log USING btree (user_id, created_at DESC);

ALTER TABLE ONLY portal.jobs
    ADD CONSTRAINT jobs_field_id_fkey FOREIGN KEY (field_id) REFERENCES portal.it_fields(id) ON DELETE SET NULL;

\unrestrict YcliiuhKIU3ybeBjgCOrrj5dRjiHZlCKTBQkjSlYLai4WKYzIcSYUQHOnQedvpb

