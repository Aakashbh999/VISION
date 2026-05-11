CREATE SCHEMA auth;

CREATE SCHEMA portal;

CREATE TYPE auth.email_status_type AS ENUM (
    'pending',
    'verified'
);

CREATE TYPE auth.user_role_type AS ENUM (
    'student',
    'admin'
);

CREATE TYPE portal.difficulty_level_enum AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);

CREATE TYPE portal.experience_level_type AS ENUM (
    'entry',
    'mid',
    'senior'
);

CREATE TYPE portal.membership_status_type AS ENUM (
    'pending',
    'approved'
);

CREATE TYPE portal.proficiency_level_type AS ENUM (
    'beginner',
    'intermediate',
    'advanced',
    'expert'
);

CREATE TYPE portal.resource_status_type AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE portal.resource_type_enum AS ENUM (
    'notes',
    'book',
    'link',
    'project'
);

CREATE TYPE portal.roadmap_user_status AS ENUM (
    'active',
    'completed',
    'left'
);

CREATE TYPE portal.student_status_type AS ENUM (
    'pending_review',
    'approved',
    'rejected'
);

CREATE FUNCTION auth.update_user_reputation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

CREATE FUNCTION portal.fn_sync_comment_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

CREATE FUNCTION portal.fn_sync_like_count() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

CREATE FUNCTION portal.refresh_trending_resources() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY portal.mv_trending_resources;
  RAISE NOTICE 'Refreshed portal.mv_trending_resources at %', NOW();
END;
$$;

CREATE FUNCTION portal.update_user_reputation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE portal.users
        SET reputation_points = reputation_points + 5
        WHERE user_id = (SELECT user_id FROM portal.discussions WHERE discussion_id = NEW.discussion_id);
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE portal.users
        SET reputation_points = reputation_points - 5
        WHERE user_id = (SELECT user_id FROM portal.discussions WHERE discussion_id = OLD.discussion_id);
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_discussion_comments_count AFTER INSERT OR DELETE OR UPDATE OF is_deleted ON portal.discussion_comments FOR EACH ROW EXECUTE FUNCTION portal.fn_sync_comment_count();

CREATE TRIGGER trg_discussion_likes_count AFTER INSERT OR DELETE ON portal.discussion_likes FOR EACH ROW EXECUTE FUNCTION portal.fn_sync_like_count();

CREATE TRIGGER trg_update_reputation_on_like AFTER INSERT OR DELETE OR UPDATE ON portal.discussion_likes FOR EACH ROW EXECUTE FUNCTION auth.update_user_reputation();