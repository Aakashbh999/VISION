BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'batch_year'
    ) THEN
        ALTER TABLE portal.users ADD COLUMN batch_year INTEGER;
        RAISE NOTICE 'Added batch_year to portal.users';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal' AND table_name = 'users' AND column_name = 'semester_is_manual'
    ) THEN
        ALTER TABLE portal.users ADD COLUMN semester_is_manual BOOLEAN NOT NULL DEFAULT FALSE;
        RAISE NOTICE 'Added semester_is_manual to portal.users';
    END IF;
END $$;

UPDATE portal.users
SET semester_is_manual = TRUE
WHERE semester IS NOT NULL AND batch_year IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'portal' AND table_name = 'group_members' AND column_name = 'permissions'
    ) THEN
        ALTER TABLE portal.group_members ADD COLUMN permissions JSONB NOT NULL DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Added permissions to portal.group_members';
    END IF;
END $$;

UPDATE portal.group_members
SET permissions = CASE
    WHEN role = 'owner' THEN jsonb_build_object(
        'manage_users', TRUE,
        'moderate_content', TRUE,
        'edit_profile', TRUE,
        'post_notice', TRUE
    )
    WHEN role = 'co_admin' THEN jsonb_build_object(
        'manage_users', TRUE,
        'moderate_content', TRUE,
        'edit_profile', TRUE,
        'post_notice', TRUE
    )
    ELSE jsonb_build_object(
        'manage_users', FALSE,
        'moderate_content', FALSE,
        'edit_profile', FALSE,
        'post_notice', FALSE
    )
END
WHERE permissions = '{}'::jsonb OR permissions IS NULL;

COMMIT;

DO $$ BEGIN RAISE NOTICE '✅ Migration 036: Academic batch + group permissions completed.'; END $$;