        target_user_id := (SELECT user_id FROM portal.discussions WHERE discussion_id = NEW.discussion_id);

        target_user_id := (SELECT user_id FROM portal.discussions WHERE discussion_id = OLD.discussion_id);

        target_user_id := (SELECT user_id FROM portal.discussions WHERE discussion_id = NEW.discussion_id);

            UPDATE portal.discussions

            UPDATE portal.discussions

            UPDATE portal.discussions

            UPDATE portal.discussions

        UPDATE portal.discussions

        UPDATE portal.discussions

CREATE TABLE portal.club_members (
    club_id integer NOT NULL,
    user_id integer NOT NULL,
    status portal.membership_status_type DEFAULT 'pending'::portal.membership_status_type
);

CREATE TABLE portal.club_tags (
    club_id integer NOT NULL,
    tag_id integer NOT NULL
);

CREATE TABLE portal.clubs (
    club_id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    location character varying(150),
    logo text,
    logo_public_id text,
    banner_image text,
    banner_image_public_id text,
    created_by integer,
    created_at timestamp without time zone DEFAULT now(),
    is_public boolean DEFAULT false,
    contact_info text
);

ALTER TABLE portal.clubs ALTER COLUMN club_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.clubs_club_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.comment_likes (
    comment_id integer NOT NULL,
    user_id integer NOT NULL,
    vote_type integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comment_likes_vote_type_check CHECK ((vote_type = ANY (ARRAY[1, '-1'::integer])))
);

CREATE TABLE portal.discussion_comments (
    comment_id integer CONSTRAINT discussion_replies_reply_id_not_null NOT NULL,
    discussion_id integer,
    user_id integer,
    content text CONSTRAINT discussion_replies_content_not_null NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp with time zone,
    parent_id integer,
    likes_count integer DEFAULT 0,
    deleted_by integer,
    deletion_reason text
);

CREATE TABLE portal.discussion_likes (
    user_id integer NOT NULL,
    discussion_id integer NOT NULL,
    vote_type integer DEFAULT 1,
    CONSTRAINT discussion_likes_vote_type_check CHECK ((vote_type = ANY (ARRAY[1, '-1'::integer])))
);

ALTER TABLE portal.discussion_comments ALTER COLUMN comment_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.discussion_replies_reply_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.discussion_tags (
    discussion_id integer NOT NULL,
    tag_id integer NOT NULL
);

CREATE TABLE portal.discussions (
    discussion_id integer NOT NULL,
    user_id integer,
    program_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    like_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_deleted boolean DEFAULT false,
    image_url text,
    image_public_id text,
    specialization_id integer,
    job_role_id integer,
    degree_id integer,
    updated_at timestamp with time zone,
    comment_count integer DEFAULT 0,
    is_boosted boolean DEFAULT false NOT NULL,
    boosted_until timestamp with time zone,
    deleted_at timestamp with time zone,
    image_caption text,
    is_system_notice boolean DEFAULT false,
    CONSTRAINT like_count_non_negative CHECK ((like_count >= 0))
);

ALTER TABLE portal.discussions ALTER COLUMN discussion_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.discussions_discussion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.group_invitations (
    invitation_id integer NOT NULL,
    group_id integer,
    sender_id integer,
    receiver_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone DEFAULT (now() + '24:00:00'::interval),
    CONSTRAINT status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'expired'::character varying])::text[])))
);

CREATE SEQUENCE portal.group_invitations_invitation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.group_invitations_invitation_id_seq OWNED BY portal.group_invitations.invitation_id;

CREATE TABLE portal.group_members (
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    status portal.membership_status_type DEFAULT 'pending'::portal.membership_status_type,
    joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(20) DEFAULT 'member'::character varying NOT NULL,
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT group_members_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'co_admin'::character varying, 'member'::character varying])::text[])))
);

CREATE TABLE portal.group_posts (
    post_id integer NOT NULL,
    group_id integer,
    user_id integer,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    image_url text,
    image_public_id text,
    section character varying(50) DEFAULT 'general'::character varying,
    deleted_at timestamp with time zone,
    deleted_by integer,
    deletion_reason text,
    file_url text,
    file_public_id text,
    file_type text,
    file_name text,
    qa_post_type text,
    qa_question_post_id bigint,
    CONSTRAINT group_posts_qa_post_type_check CHECK (((qa_post_type IS NULL) OR (qa_post_type = ANY (ARRAY['question'::text, 'answer'::text]))))
);

ALTER TABLE portal.group_posts ALTER COLUMN post_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.group_posts_post_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.group_tags (
    group_id integer NOT NULL,
    tag_id integer NOT NULL
);

CREATE TABLE portal.study_groups (
    group_id integer CONSTRAINT groups_group_id_not_null NOT NULL,
    name character varying(150) CONSTRAINT groups_name_not_null NOT NULL,
    description text,
    created_by integer,
    program_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    group_image text,
    group_image_public_id text,
    banner_image text,
    banner_image_public_id text,
    is_public boolean DEFAULT false,
    degree_id integer,
    privacy_type character varying(20) DEFAULT 'public'::character varying NOT NULL,
    capacity integer DEFAULT 15 NOT NULL,
    invite_token uuid DEFAULT gen_random_uuid(),
    last_profile_pic_update timestamp with time zone,
    last_banner_update timestamp with time zone,
    free_skips_remaining integer DEFAULT 3 NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by integer,
    deletion_reason text,
    is_hard_deleted boolean DEFAULT false,
    tags text[]
);

CREATE VIEW portal.groups AS
 SELECT group_id,
    name,
    description,
    created_by,
    program_id,
    created_at,
    group_image,
    group_image_public_id,
    banner_image,
    banner_image_public_id,
    is_public
   FROM portal.study_groups;

ALTER TABLE portal.study_groups ALTER COLUMN group_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.groups_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.it_clubs (
    id integer NOT NULL,
    slug text,
    club_name text,
    location text,
    institution text,
    specialty text,
    is_public boolean DEFAULT true,
    contact_info text,
    club_logo text,
    club_logo_public_id text,
    banner_image text,
    banner_image_public_id text,
    website_url text,
    facebook_url text,
    linkedin_url text,
    discord_url text,
    github_url text,
    description_full text,
    logo_url text,
    banner_url text,
    founded_year integer
);

CREATE SEQUENCE portal.it_clubs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.it_clubs_id_seq OWNED BY portal.it_clubs.id;

CREATE TABLE portal.join_requests (
    request_id integer NOT NULL,
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    requested_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT join_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'declined'::character varying])::text[])))
);

COMMENT ON TABLE portal.join_requests IS 'Tracks pending join requests for request-to-join and private groups.';

CREATE SEQUENCE portal.join_requests_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE portal.join_requests_request_id_seq OWNED BY portal.join_requests.request_id;

CREATE TABLE portal.saved_discussions (
    user_id integer NOT NULL,
    discussion_id integer NOT NULL,
    saved_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE portal.tags (
    tag_id integer NOT NULL,
    name character varying(100) CONSTRAINT tags_tag_name_not_null NOT NULL,
    slug character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    tag_type character varying(10) DEFAULT 'system'::character varying NOT NULL,
    CONSTRAINT tags_tag_type_check CHECK (((tag_type)::text = ANY ((ARRAY['system'::character varying, 'custom'::character varying])::text[])))
);

ALTER TABLE portal.tags ALTER COLUMN tag_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.tags_tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE portal.user_followers (
    follower_id integer NOT NULL,
    following_id integer NOT NULL,
    followed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT user_followers_check CHECK ((follower_id <> following_id))
);

COMMENT ON TABLE portal.user_followers IS 'Social follow graph between VISION users.';

CREATE TABLE portal.user_follows (
    follower_id integer NOT NULL,
    following_id integer NOT NULL
);

ALTER TABLE ONLY portal.group_invitations ALTER COLUMN invitation_id SET DEFAULT nextval('portal.group_invitations_invitation_id_seq'::regclass);

ALTER TABLE ONLY portal.it_clubs ALTER COLUMN id SET DEFAULT nextval('portal.it_clubs_id_seq'::regclass);

ALTER TABLE ONLY portal.join_requests ALTER COLUMN request_id SET DEFAULT nextval('portal.join_requests_request_id_seq'::regclass);

ALTER TABLE ONLY portal.club_members
    ADD CONSTRAINT club_members_pkey PRIMARY KEY (club_id, user_id);

ALTER TABLE ONLY portal.club_tags
    ADD CONSTRAINT club_tags_pkey PRIMARY KEY (club_id, tag_id);

ALTER TABLE ONLY portal.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (club_id);

ALTER TABLE ONLY portal.comment_likes
    ADD CONSTRAINT comment_likes_pkey PRIMARY KEY (comment_id, user_id);

ALTER TABLE ONLY portal.discussion_likes
    ADD CONSTRAINT discussion_likes_pkey PRIMARY KEY (user_id, discussion_id);

ALTER TABLE ONLY portal.discussion_comments
    ADD CONSTRAINT discussion_replies_pkey PRIMARY KEY (comment_id);

ALTER TABLE ONLY portal.discussion_tags
    ADD CONSTRAINT discussion_tags_pkey PRIMARY KEY (discussion_id, tag_id);

ALTER TABLE ONLY portal.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (discussion_id);

ALTER TABLE ONLY portal.group_invitations
    ADD CONSTRAINT group_invitations_pkey PRIMARY KEY (invitation_id);

ALTER TABLE ONLY portal.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (group_id, user_id);

ALTER TABLE ONLY portal.group_posts
    ADD CONSTRAINT group_posts_pkey PRIMARY KEY (post_id);

ALTER TABLE ONLY portal.group_tags
    ADD CONSTRAINT group_tags_pkey PRIMARY KEY (group_id, tag_id);

ALTER TABLE ONLY portal.study_groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (group_id);

ALTER TABLE ONLY portal.it_clubs
    ADD CONSTRAINT it_clubs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY portal.it_clubs
    ADD CONSTRAINT it_clubs_slug_key UNIQUE (slug);

ALTER TABLE ONLY portal.join_requests
    ADD CONSTRAINT join_requests_group_id_user_id_key UNIQUE (group_id, user_id);

ALTER TABLE ONLY portal.join_requests
    ADD CONSTRAINT join_requests_pkey PRIMARY KEY (request_id);

ALTER TABLE ONLY portal.saved_discussions
    ADD CONSTRAINT saved_discussions_pkey PRIMARY KEY (user_id, discussion_id);

ALTER TABLE ONLY portal.tags
    ADD CONSTRAINT tags_name_unique UNIQUE (name);

ALTER TABLE ONLY portal.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (tag_id);

ALTER TABLE ONLY portal.tags
    ADD CONSTRAINT tags_slug_key UNIQUE (slug);

ALTER TABLE ONLY portal.user_followers
    ADD CONSTRAINT user_followers_pkey PRIMARY KEY (follower_id, following_id);

ALTER TABLE ONLY portal.user_follows
    ADD CONSTRAINT user_follows_pkey PRIMARY KEY (follower_id, following_id);

CREATE INDEX idx_clubs_institution_trgm ON portal.it_clubs USING gin (institution auth.gin_trgm_ops);

CREATE INDEX idx_clubs_name_trgm ON portal.it_clubs USING gin (club_name auth.gin_trgm_ops);

CREATE INDEX idx_comment_likes_comment_id ON portal.comment_likes USING btree (comment_id);

CREATE INDEX idx_comments_deleted_at ON portal.discussion_comments USING btree (deleted_at);

CREATE INDEX idx_comments_likes_count ON portal.discussion_comments USING btree (likes_count);

CREATE INDEX idx_discussion_comments_active ON portal.discussion_comments USING btree (deleted_at NULLS FIRST);

CREATE INDEX idx_discussion_comments_deleted_at ON portal.discussion_comments USING btree (deleted_at);

CREATE INDEX idx_discussion_comments_discussion ON portal.discussion_comments USING btree (discussion_id);

CREATE INDEX idx_discussion_tags_discussion ON portal.discussion_tags USING btree (discussion_id);

CREATE INDEX idx_discussion_tags_tag ON portal.discussion_tags USING btree (tag_id);

CREATE INDEX idx_discussion_tags_tag_id ON portal.discussion_tags USING btree (tag_id);

CREATE INDEX idx_discussions_active_boost ON portal.discussions USING btree (boosted_until DESC NULLS LAST) WHERE (is_boosted = true);

CREATE INDEX idx_discussions_boost ON portal.discussions USING btree (is_boosted, boosted_until);

CREATE INDEX idx_discussions_comment_count ON portal.discussions USING btree (comment_count DESC);

CREATE INDEX idx_discussions_content_trgm ON portal.discussions USING gin (content auth.gin_trgm_ops);

CREATE INDEX idx_discussions_created ON portal.discussions USING btree (created_at DESC);

CREATE INDEX idx_discussions_created_at ON portal.discussions USING btree (created_at DESC);

CREATE INDEX idx_discussions_degree ON portal.discussions USING btree (degree_id);

CREATE INDEX idx_discussions_deleted ON portal.discussions USING btree (is_deleted) WHERE (is_deleted = false);

CREATE INDEX idx_discussions_deleted_at ON portal.discussions USING btree (deleted_at);

CREATE INDEX idx_discussions_is_system_notice ON portal.discussions USING btree (is_system_notice) WHERE (is_system_notice = true);

CREATE INDEX idx_discussions_job_role ON portal.discussions USING btree (job_role_id);

CREATE INDEX idx_discussions_like_count ON portal.discussions USING btree (like_count DESC);

CREATE INDEX idx_discussions_specialization ON portal.discussions USING btree (specialization_id);

CREATE INDEX idx_discussions_title_trgm ON portal.discussions USING gin (title auth.gin_trgm_ops);

CREATE INDEX idx_group_invitations_group ON portal.group_invitations USING btree (group_id);

CREATE INDEX idx_group_invitations_receiver ON portal.group_invitations USING btree (receiver_id, status);

CREATE INDEX idx_group_members_group ON portal.group_members USING btree (group_id);

CREATE INDEX idx_group_members_user ON portal.group_members USING btree (user_id);

CREATE INDEX idx_group_posts_active ON portal.group_posts USING btree (deleted_at NULLS FIRST);

CREATE INDEX idx_group_posts_created ON portal.group_posts USING btree (created_at DESC);

CREATE INDEX idx_group_posts_deleted_at ON portal.group_posts USING btree (deleted_at);

CREATE INDEX idx_group_posts_file_url ON portal.group_posts USING btree (file_url) WHERE (file_url IS NOT NULL);

CREATE INDEX idx_group_posts_group ON portal.group_posts USING btree (group_id);

CREATE INDEX idx_group_posts_group_id_post_id ON portal.group_posts USING btree (group_id, post_id DESC);

CREATE INDEX idx_group_posts_qa_answers ON portal.group_posts USING btree (qa_question_post_id) WHERE (((section)::text = 'qa'::text) AND (qa_post_type = 'answer'::text) AND (deleted_at IS NULL));

CREATE INDEX idx_group_posts_qa_questions ON portal.group_posts USING btree (group_id, user_id, created_at DESC) WHERE (((section)::text = 'qa'::text) AND (qa_post_type = 'question'::text) AND (deleted_at IS NULL));

CREATE INDEX idx_group_posts_section ON portal.group_posts USING btree (group_id, section);

CREATE INDEX idx_groups_degree_privacy ON portal.study_groups USING btree (degree_id, privacy_type);

CREATE INDEX idx_groups_description_trgm ON portal.study_groups USING gin (description auth.gin_trgm_ops);

CREATE INDEX idx_groups_name_trgm ON portal.study_groups USING gin (name auth.gin_trgm_ops);

CREATE INDEX idx_it_clubs_name ON portal.it_clubs USING gin (to_tsvector('english'::regconfig, club_name));

CREATE INDEX idx_it_clubs_specialty ON portal.it_clubs USING btree (specialty);

CREATE INDEX idx_join_requests_group ON portal.join_requests USING btree (group_id, status);

CREATE INDEX idx_join_requests_user ON portal.join_requests USING btree (user_id);

CREATE INDEX idx_replies_active ON portal.discussion_comments USING btree (discussion_id) WHERE (is_deleted = false);

CREATE INDEX idx_saved_discussions_user ON portal.saved_discussions USING btree (user_id);

CREATE INDEX idx_study_groups_active ON portal.study_groups USING btree (deleted_at NULLS FIRST);

CREATE INDEX idx_study_groups_degree ON portal.study_groups USING btree (degree_id);

CREATE INDEX idx_study_groups_deleted_at ON portal.study_groups USING btree (deleted_at);

CREATE INDEX idx_study_groups_name ON portal.study_groups USING gin (to_tsvector('english'::regconfig, (name)::text));

CREATE INDEX idx_study_groups_privacy ON portal.study_groups USING btree (privacy_type);

CREATE INDEX idx_tags_type ON portal.tags USING btree (tag_type);

CREATE INDEX idx_user_followers_follower ON portal.user_followers USING btree (follower_id);

CREATE INDEX idx_user_followers_following ON portal.user_followers USING btree (following_id);

ALTER TABLE ONLY portal.club_members
    ADD CONSTRAINT club_members_club_id_fkey FOREIGN KEY (club_id) REFERENCES portal.clubs(club_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.club_tags
    ADD CONSTRAINT club_tags_club_id_fkey FOREIGN KEY (club_id) REFERENCES portal.clubs(club_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.club_tags
    ADD CONSTRAINT club_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.comment_likes
    ADD CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES portal.discussion_comments(comment_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.discussion_comments
    ADD CONSTRAINT discussion_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES portal.discussion_comments(comment_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.discussion_likes
    ADD CONSTRAINT discussion_likes_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.discussion_comments
    ADD CONSTRAINT discussion_replies_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.discussion_tags
    ADD CONSTRAINT discussion_tags_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.discussion_tags
    ADD CONSTRAINT discussion_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.discussions
    ADD CONSTRAINT discussions_degree_id_fkey FOREIGN KEY (degree_id) REFERENCES portal.academic_degrees(id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.discussions
    ADD CONSTRAINT discussions_job_role_id_fkey FOREIGN KEY (job_role_id) REFERENCES portal.job_market_insights(id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.discussions
    ADD CONSTRAINT discussions_specialization_id_fkey FOREIGN KEY (specialization_id) REFERENCES portal.it_fields(id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.group_invitations
    ADD CONSTRAINT group_invitations_group_id_fkey FOREIGN KEY (group_id) REFERENCES portal.study_groups(group_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES portal.study_groups(group_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.group_posts
    ADD CONSTRAINT group_posts_group_id_fkey FOREIGN KEY (group_id) REFERENCES portal.study_groups(group_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.group_posts
    ADD CONSTRAINT group_posts_qa_question_fk FOREIGN KEY (qa_question_post_id) REFERENCES portal.group_posts(post_id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.group_tags
    ADD CONSTRAINT group_tags_group_id_fkey FOREIGN KEY (group_id) REFERENCES portal.study_groups(group_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.group_tags
    ADD CONSTRAINT group_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.join_requests
    ADD CONSTRAINT join_requests_group_id_fkey FOREIGN KEY (group_id) REFERENCES portal.study_groups(group_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.saved_discussions
    ADD CONSTRAINT saved_discussions_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.study_groups
    ADD CONSTRAINT study_groups_degree_id_fkey FOREIGN KEY (degree_id) REFERENCES portal.academic_degrees(id) ON DELETE SET NULL;

ALTER TABLE ONLY portal.user_interests
    ADD CONSTRAINT user_interests_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;

ALTER TABLE ONLY portal.user_tag_profile
    ADD CONSTRAINT user_tag_profile_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;