-- Migration 050: Fix Membership Status
-- Sets existing 'pending' group memberships to 'approved' for:
-- 1. Owners and Co-Admins (who should always be approved)
-- 2. Members of 'public' groups (who join automatically)

BEGIN;

-- 1. Fix Owners and Co-Admins
UPDATE portal.group_members
SET status = 'approved'
WHERE (role = 'owner' OR role = 'co_admin')
  AND status != 'approved';

-- 2. Fix Members in Public Groups
UPDATE portal.group_members gm
SET status = 'approved'
FROM portal.study_groups sg
WHERE gm.group_id = sg.group_id
  AND sg.privacy_type = 'public'
  AND gm.status != 'approved';

COMMIT;

DO $$ BEGIN RAISE NOTICE '✅ Migration 050: Membership status data fix completed.'; END $$;
