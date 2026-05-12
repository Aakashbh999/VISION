CREATE TABLE portal.field_skills (
    field_id integer NOT NULL,
    skill_id integer NOT NULL,
    importance_score integer DEFAULT 50,
    CONSTRAINT field_skills_importance_score_check CHECK (((importance_score >= 0) AND (importance_score <= 100)))
);

CREATE TABLE portal.job_market_insights (
    id integer NOT NULL,
    slug text,
    role_name text,
    salary_range text,
    market_demand text,
    key_skills text,
    job_summary text,
    description text,
    is_public boolean DEFAULT true
);

CREATE TABLE portal.job_skills (
    job_id integer NOT NULL,
    skill_id integer NOT NULL,
    is_required boolean DEFAULT true
);

CREATE TABLE portal.resource_scores (
    score_id integer NOT NULL,
    user_id integer NOT NULL,
    resource_id integer NOT NULL,
    score numeric(6,2) NOT NULL,
    reason text,
    calculated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT resource_scores_score_check CHECK (((score >= (0)::numeric) AND (score <= (100)::numeric)))
);

COMMENT ON TABLE portal.resource_scores IS 'User-specific resource scores for personalized recommendations (0-100 scale)';

CREATE TABLE portal.resources (
    resource_id integer NOT NULL,
    program_id integer,
    semester integer,
    subject_name character varying(150),
    title character varying(255) NOT NULL,
    resource_type portal.resource_type_enum,
    url text,
    description text,
    difficulty_level portal.difficulty_level_enum DEFAULT 'beginner'::portal.difficulty_level_enum,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    degree_id integer,
    status portal.resource_status_type DEFAULT 'pending'::portal.resource_status_type NOT NULL,
    created_by integer,
    file_url text,
    file_public_id text,
    original_filename text,
    deleted_at timestamp with time zone,
    deleted_by integer,
    deletion_reason text,
    rejection_reason text
);

CREATE TABLE portal.user_resource_interactions (
    interaction_id integer NOT NULL,
    user_id integer NOT NULL,
    resource_id integer NOT NULL,
    interaction_type character varying(20) NOT NULL,
    interaction_value smallint DEFAULT 1,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_resource_interactions_interaction_type_check CHECK (((interaction_type)::text = ANY ((ARRAY['view'::character varying, 'click'::character varying, 'bookmark'::character varying, 'complete'::character varying, 'like'::character varying, 'dislike'::character varying])::text[])))
);

CREATE MATERIALIZED VIEW portal.mv_trending_resources AS
 SELECT r.resource_id,
    r.title,
    r.program_id,
    r.semester,
    count(DISTINCT uri.user_id) AS interaction_count,
    COALESCE(avg(rs.score), (0)::numeric) AS avg_recommendation_score,
    (((count(DISTINCT uri.user_id) * 2))::numeric + COALESCE(avg(rs.score), (0)::numeric)) AS trend_score
   FROM ((portal.resources r
     LEFT JOIN portal.user_resource_interactions uri ON (((uri.resource_id = r.resource_id) AND (uri.created_at > (now() - '30 days'::interval)))))
     LEFT JOIN portal.resource_scores rs ON ((rs.resource_id = r.resource_id)))
  WHERE ((r.status = 'approved'::portal.resource_status_type) AND (r.deleted_at IS NULL))
  GROUP BY r.resource_id, r.title, r.program_id, r.semester
 HAVING (count(DISTINCT uri.user_id) >= 1)
  ORDER BY (((count(DISTINCT uri.user_id) * 2))::numeric + COALESCE(avg(rs.score), (0)::numeric)) DESC
  WITH NO DATA;

CREATE TABLE portal.program_roadmaps (
    program_id integer NOT NULL,
    roadmap_id integer NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE portal.resource_scores ALTER COLUMN score_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.resource_scores_score_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.resource_tags (
    resource_id integer NOT NULL,
    tag_id integer NOT NULL
);

COMMENT ON TABLE portal.resource_tags IS 'Many-to-many relationship between resources and tags for categorization';

ALTER TABLE portal.resources ALTER COLUMN resource_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.resources_resource_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.roadmap_steps (
    step_id integer NOT NULL,
    roadmap_id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text,
    step_order integer NOT NULL,
    estimated_time character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    prerequisite_step_id integer,
    deleted_at timestamp with time zone
);

COMMENT ON TABLE portal.roadmap_steps IS 'Individual steps within a roadmap, ordered by step_order';

ALTER TABLE portal.roadmap_steps ALTER COLUMN step_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.roadmap_steps_step_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.roadmaps (
    roadmap_id integer NOT NULL,
    title character varying(150) NOT NULL,
    slug character varying(150) NOT NULL,
    description text,
    difficulty_level character varying(20),
    estimated_duration character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    specialization_id integer,
    deleted_at timestamp with time zone,
    CONSTRAINT roadmaps_difficulty_level_check CHECK (((difficulty_level)::text = ANY ((ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying])::text[])))
);

COMMENT ON TABLE portal.roadmaps IS 'Learning roadmaps that can be linked to IT specializations via specialization_id (it_fields.id)';

ALTER TABLE portal.roadmaps ALTER COLUMN roadmap_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.roadmaps_roadmap_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.skills (
    skill_id integer NOT NULL,
    name character varying(100) NOT NULL,
    category character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE portal.skills_skill_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.skills_skill_id_seq OWNED BY portal.skills.skill_id;

CREATE TABLE portal.step_resource_map (
    step_id integer NOT NULL,
    resource_id integer NOT NULL,
    is_required boolean DEFAULT true
);

COMMENT ON TABLE portal.step_resource_map IS 'Maps resources to roadmap steps with required/optional flag';

CREATE TABLE portal.user_goals (
    goal_id integer NOT NULL,
    user_id integer NOT NULL,
    goal_type character varying NOT NULL,
    target_count integer NOT NULL,
    current_count integer DEFAULT 0,
    deadline date NOT NULL,
    vxp_reward integer NOT NULL,
    status character varying DEFAULT 'active'::character varying,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp without time zone,
    failed_at timestamp without time zone,
    CONSTRAINT chk_goal_status CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'completed'::character varying, 'failed'::character varying])::text[]))),
    CONSTRAINT chk_goal_type CHECK (((goal_type)::text = ANY ((ARRAY['resources'::character varying, 'discussions'::character varying, 'roadmap_steps'::character varying, 'custom'::character varying])::text[]))),
    CONSTRAINT chk_target_positive CHECK ((target_count > 0)),
    CONSTRAINT chk_vxp_reward_positive CHECK ((vxp_reward > 0))
);

ALTER TABLE portal.user_resource_interactions ALTER COLUMN interaction_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.user_resource_interactions_interaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.user_roadmap_enrolments (
    enrolment_id integer NOT NULL,
    user_id integer NOT NULL,
    roadmap_id integer NOT NULL,
    status portal.roadmap_user_status DEFAULT 'active'::portal.roadmap_user_status,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_activity_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone,
    left_at timestamp with time zone
);

COMMENT ON TABLE portal.user_roadmap_enrolments IS 'Tracks the high-level participation state of a user in a specific roadmap.';

ALTER TABLE portal.user_roadmap_enrolments ALTER COLUMN enrolment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.user_roadmap_enrolments_enrolment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.user_roadmap_progress (
    progress_id integer NOT NULL,
    user_id integer NOT NULL,
    step_id integer NOT NULL,
    is_completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    submission_text text,
    submission_link text,
    is_verified boolean DEFAULT false,
    points_earned integer,
    first_viewed_at timestamp with time zone
);

COMMENT ON COLUMN portal.user_roadmap_progress.submission_text IS 'The key insight or proof of work submitted by the student';

COMMENT ON COLUMN portal.user_roadmap_progress.submission_link IS 'Optional external link to project or reference';

COMMENT ON COLUMN portal.user_roadmap_progress.is_verified IS 'Whether the submission met the keyword auto-verification criteria';

COMMENT ON COLUMN portal.user_roadmap_progress.points_earned IS 'The specific VXP granted for this step completion';

COMMENT ON COLUMN portal.user_roadmap_progress.first_viewed_at IS 'The timestamp when the user first interacted with any resource in this step. Used for the 24h lockout rule.';

ALTER TABLE portal.user_roadmap_progress ALTER COLUMN progress_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.user_roadmap_progress_progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.user_skills (
    user_id integer NOT NULL,
    skill_id integer NOT NULL,
    proficiency_level portal.proficiency_level_type DEFAULT 'beginner'::portal.proficiency_level_type,
    verified boolean DEFAULT false,
    acquired_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portal.user_stats (
    user_id integer NOT NULL,
    total_xp integer DEFAULT 0,
    current_level integer DEFAULT 1,
    roadmaps_completed integer DEFAULT 0,
    last_activity timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    current_streak integer DEFAULT 0 NOT NULL
);

ALTER TABLE ONLY portal.skills ALTER COLUMN skill_id SET DEFAULT nextval('portal.skills_skill_id_seq'::regclass);

ALTER TABLE ONLY portal.field_skills
    ADD CONSTRAINT field_skills_pkey PRIMARY KEY (field_id, skill_id);

ALTER TABLE ONLY portal.job_skills
    ADD CONSTRAINT job_skills_pkey PRIMARY KEY (job_id, skill_id);

ALTER TABLE ONLY portal.program_roadmaps
    ADD CONSTRAINT program_roadmaps_pkey PRIMARY KEY (program_id, roadmap_id);

ALTER TABLE ONLY portal.resource_scores
    ADD CONSTRAINT resource_scores_pkey PRIMARY KEY (score_id);

ALTER TABLE ONLY portal.resource_scores
    ADD CONSTRAINT resource_scores_user_id_resource_id_key UNIQUE (user_id, resource_id);

ALTER TABLE ONLY portal.resource_tags
    ADD CONSTRAINT resource_tags_pkey PRIMARY KEY (resource_id, tag_id);

ALTER TABLE ONLY portal.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (resource_id);

ALTER TABLE ONLY portal.roadmap_steps
    ADD CONSTRAINT roadmap_steps_pkey PRIMARY KEY (step_id);

ALTER TABLE ONLY portal.roadmap_steps
    ADD CONSTRAINT roadmap_steps_roadmap_id_step_order_key UNIQUE (roadmap_id, step_order);

ALTER TABLE ONLY portal.roadmaps
    ADD CONSTRAINT roadmaps_pkey PRIMARY KEY (roadmap_id);

ALTER TABLE ONLY portal.roadmaps
    ADD CONSTRAINT roadmaps_slug_key UNIQUE (slug);

ALTER TABLE ONLY portal.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);

ALTER TABLE ONLY portal.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (skill_id);

ALTER TABLE ONLY portal.step_resource_map
    ADD CONSTRAINT step_resource_map_pkey PRIMARY KEY (step_id, resource_id);

ALTER TABLE ONLY portal.user_roadmap_enrolments
    ADD CONSTRAINT unique_user_roadmap_enrolment UNIQUE (user_id, roadmap_id);

ALTER TABLE ONLY portal.resource_tags
    ADD CONSTRAINT uq_resource_tag UNIQUE (resource_id, tag_id);

ALTER TABLE ONLY portal.user_resource_interactions
    ADD CONSTRAINT user_resource_interactions_pkey PRIMARY KEY (interaction_id);

ALTER TABLE ONLY portal.user_roadmap_enrolments
    ADD CONSTRAINT user_roadmap_enrolments_pkey PRIMARY KEY (enrolment_id);

ALTER TABLE ONLY portal.user_roadmap_progress
    ADD CONSTRAINT user_roadmap_progress_pkey PRIMARY KEY (progress_id);

ALTER TABLE ONLY portal.user_roadmap_progress
    ADD CONSTRAINT user_roadmap_progress_user_id_step_id_key UNIQUE (user_id, step_id);

ALTER TABLE ONLY portal.user_skills
    ADD CONSTRAINT user_skills_pkey PRIMARY KEY (user_id, skill_id);

CREATE INDEX idx_field_skills_field ON portal.field_skills USING btree (field_id);

CREATE INDEX idx_job_skills_skill ON portal.job_skills USING btree (skill_id);

CREATE INDEX idx_mv_trending_resources_program ON portal.mv_trending_resources USING btree (program_id);

CREATE INDEX idx_mv_trending_resources_trend ON portal.mv_trending_resources USING btree (trend_score DESC);

CREATE INDEX idx_program_roadmaps_program ON portal.program_roadmaps USING btree (program_id);

CREATE INDEX idx_program_roadmaps_roadmap ON portal.program_roadmaps USING btree (roadmap_id);

CREATE INDEX idx_resource_scores_resource ON portal.resource_scores USING btree (resource_id);

CREATE INDEX idx_resource_scores_score ON portal.resource_scores USING btree (score DESC);

CREATE INDEX idx_resource_scores_user ON portal.resource_scores USING btree (user_id);

CREATE INDEX idx_resource_tags_resource ON portal.resource_tags USING btree (resource_id);

CREATE INDEX idx_resource_tags_tag ON portal.resource_tags USING btree (tag_id);

CREATE INDEX idx_resource_tags_tag_id ON portal.resource_tags USING btree (tag_id);

CREATE INDEX idx_resources_active ON portal.resources USING btree (deleted_at NULLS FIRST);

CREATE INDEX idx_resources_created_at ON portal.resources USING btree (created_at DESC);

CREATE INDEX idx_resources_created_by ON portal.resources USING btree (created_by);

CREATE INDEX idx_resources_degree ON portal.resources USING btree (degree_id);

CREATE INDEX idx_resources_deleted_at ON portal.resources USING btree (deleted_at);

CREATE INDEX idx_resources_description_trgm ON portal.resources USING gin (description auth.gin_trgm_ops);

CREATE INDEX idx_resources_difficulty ON portal.resources USING btree (difficulty_level);

CREATE INDEX idx_resources_file_public_id ON portal.resources USING btree (file_public_id) WHERE (file_public_id IS NOT NULL);

CREATE INDEX idx_resources_program ON portal.resources USING btree (program_id);

CREATE INDEX idx_resources_program_semester ON portal.resources USING btree (program_id, semester);

CREATE INDEX idx_resources_status ON portal.resources USING btree (status);

CREATE INDEX idx_resources_status_pending ON portal.resources USING btree (status) WHERE (status = 'pending'::portal.resource_status_type);

CREATE INDEX idx_resources_status_semester ON portal.resources USING btree (status, semester) WHERE (status = 'approved'::portal.resource_status_type);

CREATE INDEX idx_resources_subject ON portal.resources USING btree (subject_name);

CREATE INDEX idx_resources_title_trgm ON portal.resources USING gin (title auth.gin_trgm_ops);

CREATE INDEX idx_resources_type ON portal.resources USING btree (resource_type);

CREATE INDEX idx_roadmap_steps_order ON portal.roadmap_steps USING btree (step_order);

CREATE INDEX idx_roadmap_steps_roadmap ON portal.roadmap_steps USING btree (roadmap_id);

CREATE INDEX idx_roadmaps_description_trgm ON portal.roadmaps USING gin (description auth.gin_trgm_ops);

CREATE INDEX idx_roadmaps_specialization ON portal.roadmaps USING btree (specialization_id);

CREATE INDEX idx_roadmaps_title_trgm ON portal.roadmaps USING gin (title auth.gin_trgm_ops);

CREATE INDEX idx_skills_category ON portal.skills USING btree (category);

CREATE INDEX idx_step_resource_map_resource ON portal.step_resource_map USING btree (resource_id);

CREATE INDEX idx_step_resource_map_step ON portal.step_resource_map USING btree (step_id);

CREATE INDEX idx_user_active_roadmap_enrolment ON portal.user_roadmap_enrolments USING btree (user_id) WHERE (status = 'active'::portal.roadmap_user_status);

CREATE INDEX idx_user_left_roadmap_enrolment ON portal.user_roadmap_enrolments USING btree (user_id) WHERE (status = 'left'::portal.roadmap_user_status);

CREATE INDEX idx_user_resource_interactions_resource ON portal.user_resource_interactions USING btree (resource_id);

CREATE INDEX idx_user_resource_interactions_user ON portal.user_resource_interactions USING btree (user_id, resource_id, interaction_type);

CREATE INDEX idx_user_skills_user ON portal.user_skills USING btree (user_id);

CREATE UNIQUE INDEX unique_user_resource_action ON portal.user_resource_interactions USING btree (user_id, resource_id, interaction_type) WHERE ((interaction_type)::text = ANY ((ARRAY['bookmark'::character varying, 'like'::character varying, 'dislike'::character varying, 'complete'::character varying])::text[]));

ALTER TABLE ONLY portal.field_skills
    ADD CONSTRAINT field_skills_field_id_fkey FOREIGN KEY (field_id) REFERENCES portal.it_fields(id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.field_skills
    ADD CONSTRAINT field_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES portal.skills(skill_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.job_skills
    ADD CONSTRAINT job_skills_job_id_fkey FOREIGN KEY (job_id) REFERENCES portal.jobs(job_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.job_skills
    ADD CONSTRAINT job_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES portal.skills(skill_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.program_roadmaps
    ADD CONSTRAINT program_roadmaps_roadmap_id_fkey FOREIGN KEY (roadmap_id) REFERENCES portal.roadmaps(roadmap_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.resource_scores
    ADD CONSTRAINT resource_scores_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES portal.resources(resource_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.resource_tags
    ADD CONSTRAINT resource_tags_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES portal.resources(resource_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.resource_tags
    ADD CONSTRAINT resource_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.resources
    ADD CONSTRAINT resources_degree_id_fkey FOREIGN KEY (degree_id) REFERENCES portal.academic_degrees(id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.roadmap_steps
    ADD CONSTRAINT roadmap_steps_prerequisite_step_id_fkey FOREIGN KEY (prerequisite_step_id) REFERENCES portal.roadmap_steps(step_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.roadmap_steps
    ADD CONSTRAINT roadmap_steps_roadmap_id_fkey FOREIGN KEY (roadmap_id) REFERENCES portal.roadmaps(roadmap_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.roadmaps
    ADD CONSTRAINT roadmaps_specialization_id_fkey FOREIGN KEY (specialization_id) REFERENCES portal.it_fields(id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.step_resource_map
    ADD CONSTRAINT step_resource_map_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES portal.resources(resource_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.step_resource_map
    ADD CONSTRAINT step_resource_map_step_id_fkey FOREIGN KEY (step_id) REFERENCES portal.roadmap_steps(step_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_resource_interactions
    ADD CONSTRAINT user_resource_interactions_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES portal.resources(resource_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_roadmap_enrolments
    ADD CONSTRAINT user_roadmap_enrolments_roadmap_id_fkey FOREIGN KEY (roadmap_id) REFERENCES portal.roadmaps(roadmap_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_roadmap_progress
    ADD CONSTRAINT user_roadmap_progress_step_id_fkey FOREIGN KEY (step_id) REFERENCES portal.roadmap_steps(step_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_skills
    ADD CONSTRAINT user_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES portal.skills(skill_id) ON DELETE CASCADE;