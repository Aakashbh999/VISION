--
-- PostgreSQL database dump
--

\restrict FdnBibgM2Z2qdbPPDGgqDEDWrI1vccM3u5JdDsxmiIKiJzIq0NYCPNqROwOln12

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO postgres;

--
-- Name: portal; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA portal;


ALTER SCHEMA portal OWNER TO postgres;

--
-- Name: email_status_type; Type: TYPE; Schema: auth; Owner: postgres
--

CREATE TYPE auth.email_status_type AS ENUM (
    'pending',
    'verified'
);


ALTER TYPE auth.email_status_type OWNER TO postgres;

--
-- Name: membership_status_type; Type: TYPE; Schema: portal; Owner: postgres
--

CREATE TYPE portal.membership_status_type AS ENUM (
    'pending',
    'approved'
);


ALTER TYPE portal.membership_status_type OWNER TO postgres;

--
-- Name: resource_type_enum; Type: TYPE; Schema: portal; Owner: postgres
--

CREATE TYPE portal.resource_type_enum AS ENUM (
    'notes',
    'book',
    'link',
    'project'
);


ALTER TYPE portal.resource_type_enum OWNER TO postgres;

--
-- Name: student_status_type; Type: TYPE; Schema: portal; Owner: postgres
--

CREATE TYPE portal.student_status_type AS ENUM (
    'pending_review',
    'approved',
    'rejected'
);


ALTER TYPE portal.student_status_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: email_verification_tokens; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.email_verification_tokens (
    token_id integer NOT NULL,
    auth_user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE auth.email_verification_tokens OWNER TO postgres;

--
-- Name: email_verification_tokens_token_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.email_verification_tokens ALTER COLUMN token_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.email_verification_tokens_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: password_reset_tokens; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.password_reset_tokens (
    token_id integer NOT NULL,
    auth_user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE auth.password_reset_tokens OWNER TO postgres;

--
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.password_reset_tokens ALTER COLUMN token_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.password_reset_tokens_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: auth; Owner: postgres
--

CREATE TABLE auth.users (
    auth_user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    email_status auth.email_status_type DEFAULT 'pending'::auth.email_status_type,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp with time zone
);


ALTER TABLE auth.users OWNER TO postgres;

--
-- Name: users_auth_user_id_seq; Type: SEQUENCE; Schema: auth; Owner: postgres
--

ALTER TABLE auth.users ALTER COLUMN auth_user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME auth.users_auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: club_members; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.club_members (
    club_id integer NOT NULL,
    user_id integer NOT NULL,
    status portal.membership_status_type DEFAULT 'pending'::portal.membership_status_type
);


ALTER TABLE portal.club_members OWNER TO postgres;

--
-- Name: club_tags; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.club_tags (
    club_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE portal.club_tags OWNER TO postgres;

--
-- Name: clubs; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.clubs (
    club_id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    location character varying(150)
);


ALTER TABLE portal.clubs OWNER TO postgres;

--
-- Name: clubs_club_id_seq; Type: SEQUENCE; Schema: portal; Owner: postgres
--

ALTER TABLE portal.clubs ALTER COLUMN club_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.clubs_club_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: discussion_likes; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.discussion_likes (
    user_id integer NOT NULL,
    discussion_id integer NOT NULL
);


ALTER TABLE portal.discussion_likes OWNER TO postgres;

--
-- Name: discussion_replies; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.discussion_replies (
    reply_id integer NOT NULL,
    discussion_id integer,
    user_id integer,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE portal.discussion_replies OWNER TO postgres;

--
-- Name: discussion_replies_reply_id_seq; Type: SEQUENCE; Schema: portal; Owner: postgres
--

ALTER TABLE portal.discussion_replies ALTER COLUMN reply_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.discussion_replies_reply_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: discussion_tags; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.discussion_tags (
    discussion_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE portal.discussion_tags OWNER TO postgres;

--
-- Name: discussions; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.discussions (
    discussion_id integer NOT NULL,
    user_id integer,
    program_id integer,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    like_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE portal.discussions OWNER TO postgres;

--
-- Name: discussions_discussion_id_seq; Type: SEQUENCE; Schema: portal; Owner: postgres
--

ALTER TABLE portal.discussions ALTER COLUMN discussion_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.discussions_discussion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: group_members; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.group_members (
    group_id integer NOT NULL,
    user_id integer NOT NULL,
    status portal.membership_status_type DEFAULT 'pending'::portal.membership_status_type
);


ALTER TABLE portal.group_members OWNER TO postgres;

--
-- Name: group_posts; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.group_posts (
    post_id integer NOT NULL,
    group_id integer,
    user_id integer,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE portal.group_posts OWNER TO postgres;

--
-- Name: group_posts_post_id_seq; Type: SEQUENCE; Schema: portal; Owner: postgres
--

ALTER TABLE portal.group_posts ALTER COLUMN post_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.group_posts_post_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: group_tags; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.group_tags (
    group_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE portal.group_tags OWNER TO postgres;

--
-- Name: groups; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.groups (
    group_id integer NOT NULL,
    name character varying(150) NOT NULL,
    description text,
    created_by integer,
    program_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE portal.groups OWNER TO postgres;

--
-- Name: groups_group_id_seq; Type: SEQUENCE; Schema: portal; Owner: postgres
--

ALTER TABLE portal.groups ALTER COLUMN group_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.groups_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.notifications (
    notification_id integer NOT NULL,
    user_id integer,
    message text NOT NULL,
    related_type character varying(50),
    related_id integer,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE portal.notifications OWNER TO postgres;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: portal; Owner: postgres
--

ALTER TABLE portal.notifications ALTER COLUMN notification_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.notifications_notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: programs; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.programs (
    program_id integer NOT NULL,
    program_name character varying(100) NOT NULL
);


ALTER TABLE portal.programs OWNER TO postgres;

--
-- Name: programs_program_id_seq; Type: SEQUENCE; Schema: portal; Owner: postgres
--

ALTER TABLE portal.programs ALTER COLUMN program_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.programs_program_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: resource_tags; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.resource_tags (
    resource_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE portal.resource_tags OWNER TO postgres;

--
-- Name: resources; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.resources (
    resource_id integer NOT NULL,
    program_id integer,
    semester integer,
    subject_name character varying(150),
    title character varying(255) NOT NULL,
    resource_type portal.resource_type_enum,
    url text,
    description text
);


ALTER TABLE portal.resources OWNER TO postgres;

--
-- Name: resources_resource_id_seq; Type: SEQUENCE; Schema: portal; Owner: postgres
--

ALTER TABLE portal.resources ALTER COLUMN resource_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.resources_resource_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tags; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.tags (
    tag_id integer NOT NULL,
    tag_name character varying(100) NOT NULL
);


ALTER TABLE portal.tags OWNER TO postgres;

--
-- Name: tags_tag_id_seq; Type: SEQUENCE; Schema: portal; Owner: postgres
--

ALTER TABLE portal.tags ALTER COLUMN tag_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.tags_tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_follows; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.user_follows (
    follower_id integer NOT NULL,
    following_id integer NOT NULL
);


ALTER TABLE portal.user_follows OWNER TO postgres;

--
-- Name: user_interests; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.user_interests (
    user_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE portal.user_interests OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: portal; Owner: postgres
--

CREATE TABLE portal.users (
    user_id integer NOT NULL,
    auth_user_id integer NOT NULL,
    full_name character varying(100) NOT NULL,
    university character varying(100) DEFAULT 'TU'::character varying,
    campus character varying(150),
    program_id integer,
    semester integer,
    tu_registration_no character varying(50),
    student_id_image_url text,
    student_status portal.student_status_type DEFAULT 'pending_review'::portal.student_status_type,
    verified_by_admin_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE portal.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: portal; Owner: postgres
--

ALTER TABLE portal.users ALTER COLUMN user_id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME portal.users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (token_id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (token_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (auth_user_id);


--
-- Name: club_members club_members_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.club_members
    ADD CONSTRAINT club_members_pkey PRIMARY KEY (club_id, user_id);


--
-- Name: club_tags club_tags_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.club_tags
    ADD CONSTRAINT club_tags_pkey PRIMARY KEY (club_id, tag_id);


--
-- Name: clubs clubs_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (club_id);


--
-- Name: discussion_likes discussion_likes_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussion_likes
    ADD CONSTRAINT discussion_likes_pkey PRIMARY KEY (user_id, discussion_id);


--
-- Name: discussion_replies discussion_replies_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussion_replies
    ADD CONSTRAINT discussion_replies_pkey PRIMARY KEY (reply_id);


--
-- Name: discussion_tags discussion_tags_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussion_tags
    ADD CONSTRAINT discussion_tags_pkey PRIMARY KEY (discussion_id, tag_id);


--
-- Name: discussions discussions_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussions
    ADD CONSTRAINT discussions_pkey PRIMARY KEY (discussion_id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (group_id, user_id);


--
-- Name: group_posts group_posts_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.group_posts
    ADD CONSTRAINT group_posts_pkey PRIMARY KEY (post_id);


--
-- Name: group_tags group_tags_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.group_tags
    ADD CONSTRAINT group_tags_pkey PRIMARY KEY (group_id, tag_id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (group_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (program_id);


--
-- Name: programs programs_program_name_key; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.programs
    ADD CONSTRAINT programs_program_name_key UNIQUE (program_name);


--
-- Name: resource_tags resource_tags_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.resource_tags
    ADD CONSTRAINT resource_tags_pkey PRIMARY KEY (resource_id, tag_id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (resource_id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (tag_id);


--
-- Name: tags tags_tag_name_key; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.tags
    ADD CONSTRAINT tags_tag_name_key UNIQUE (tag_name);


--
-- Name: user_follows user_follows_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.user_follows
    ADD CONSTRAINT user_follows_pkey PRIMARY KEY (follower_id, following_id);


--
-- Name: user_interests user_interests_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.user_interests
    ADD CONSTRAINT user_interests_pkey PRIMARY KEY (user_id, tag_id);


--
-- Name: users users_auth_user_id_key; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_auth_user_id_key UNIQUE (auth_user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: email_verification_tokens email_verification_tokens_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(auth_user_id) ON DELETE CASCADE;


--
-- Name: password_reset_tokens password_reset_tokens_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: postgres
--

ALTER TABLE ONLY auth.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(auth_user_id) ON DELETE CASCADE;


--
-- Name: club_members club_members_club_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.club_members
    ADD CONSTRAINT club_members_club_id_fkey FOREIGN KEY (club_id) REFERENCES portal.clubs(club_id) ON DELETE CASCADE;


--
-- Name: club_members club_members_user_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.club_members
    ADD CONSTRAINT club_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;


--
-- Name: club_tags club_tags_club_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.club_tags
    ADD CONSTRAINT club_tags_club_id_fkey FOREIGN KEY (club_id) REFERENCES portal.clubs(club_id) ON DELETE CASCADE;


--
-- Name: club_tags club_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.club_tags
    ADD CONSTRAINT club_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;


--
-- Name: discussion_likes discussion_likes_discussion_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussion_likes
    ADD CONSTRAINT discussion_likes_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE;


--
-- Name: discussion_likes discussion_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussion_likes
    ADD CONSTRAINT discussion_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;


--
-- Name: discussion_replies discussion_replies_discussion_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussion_replies
    ADD CONSTRAINT discussion_replies_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE;


--
-- Name: discussion_replies discussion_replies_user_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussion_replies
    ADD CONSTRAINT discussion_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;


--
-- Name: discussion_tags discussion_tags_discussion_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussion_tags
    ADD CONSTRAINT discussion_tags_discussion_id_fkey FOREIGN KEY (discussion_id) REFERENCES portal.discussions(discussion_id) ON DELETE CASCADE;


--
-- Name: discussion_tags discussion_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussion_tags
    ADD CONSTRAINT discussion_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;


--
-- Name: discussions discussions_program_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussions
    ADD CONSTRAINT discussions_program_id_fkey FOREIGN KEY (program_id) REFERENCES portal.programs(program_id) ON DELETE SET NULL;


--
-- Name: discussions discussions_user_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.discussions
    ADD CONSTRAINT discussions_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;


--
-- Name: group_members group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES portal.groups(group_id) ON DELETE CASCADE;


--
-- Name: group_members group_members_user_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.group_members
    ADD CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;


--
-- Name: group_posts group_posts_group_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.group_posts
    ADD CONSTRAINT group_posts_group_id_fkey FOREIGN KEY (group_id) REFERENCES portal.groups(group_id) ON DELETE CASCADE;


--
-- Name: group_posts group_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.group_posts
    ADD CONSTRAINT group_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;


--
-- Name: group_tags group_tags_group_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.group_tags
    ADD CONSTRAINT group_tags_group_id_fkey FOREIGN KEY (group_id) REFERENCES portal.groups(group_id) ON DELETE CASCADE;


--
-- Name: group_tags group_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.group_tags
    ADD CONSTRAINT group_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;


--
-- Name: groups groups_created_by_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.groups
    ADD CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES portal.users(user_id) ON DELETE SET NULL;


--
-- Name: groups groups_program_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.groups
    ADD CONSTRAINT groups_program_id_fkey FOREIGN KEY (program_id) REFERENCES portal.programs(program_id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;


--
-- Name: resource_tags resource_tags_resource_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.resource_tags
    ADD CONSTRAINT resource_tags_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES portal.resources(resource_id) ON DELETE CASCADE;


--
-- Name: resource_tags resource_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.resource_tags
    ADD CONSTRAINT resource_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;


--
-- Name: resources resources_program_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.resources
    ADD CONSTRAINT resources_program_id_fkey FOREIGN KEY (program_id) REFERENCES portal.programs(program_id) ON DELETE SET NULL;


--
-- Name: user_follows user_follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.user_follows
    ADD CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;


--
-- Name: user_follows user_follows_following_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.user_follows
    ADD CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;


--
-- Name: user_interests user_interests_tag_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.user_interests
    ADD CONSTRAINT user_interests_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES portal.tags(tag_id) ON DELETE CASCADE;


--
-- Name: user_interests user_interests_user_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.user_interests
    ADD CONSTRAINT user_interests_user_id_fkey FOREIGN KEY (user_id) REFERENCES portal.users(user_id) ON DELETE CASCADE;


--
-- Name: users users_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(auth_user_id) ON DELETE CASCADE;


--
-- Name: users users_program_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_program_id_fkey FOREIGN KEY (program_id) REFERENCES portal.programs(program_id) ON DELETE SET NULL;


--
-- Name: users users_verified_by_admin_id_fkey; Type: FK CONSTRAINT; Schema: portal; Owner: postgres
--

ALTER TABLE ONLY portal.users
    ADD CONSTRAINT users_verified_by_admin_id_fkey FOREIGN KEY (verified_by_admin_id) REFERENCES portal.users(user_id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict FdnBibgM2Z2qdbPPDGgqDEDWrI1vccM3u5JdDsxmiIKiJzIq0NYCPNqROwOln12

