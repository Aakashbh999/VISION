SET search_path TO portal, auth, public;

-- Find test users
CREATE TEMP TABLE test_user_ids AS
SELECT p.user_id, p.auth_user_id
FROM portal.users p
JOIN auth.users a ON p.auth_user_id = a.auth_user_id
WHERE p.full_name ILIKE '%test%' 
   OR p.full_name ILIKE '%dummy%'
   OR a.email ILIKE '%test%'
   OR a.email ILIKE '%dummy%'
   OR a.email ILIKE '%@vision.local';

-- Log what we found
SELECT 'Found ' || count(*) || ' test users' FROM test_user_ids;

-- Delete related data
DELETE FROM portal.discussion_comments WHERE author_id IN (SELECT user_id FROM test_user_ids);
DELETE FROM portal.discussions WHERE author_id IN (SELECT user_id FROM test_user_ids);

-- Delete resources (EXCEPT those used in roadmaps)
DELETE FROM portal.resources 
WHERE added_by IN (SELECT user_id FROM test_user_ids)
AND resource_id NOT IN (SELECT resource_id FROM portal.step_resource_map);

DELETE FROM portal.group_members WHERE user_id IN (SELECT user_id FROM test_user_ids);
DELETE FROM portal.xp_transactions WHERE user_id IN (SELECT user_id FROM test_user_ids);
DELETE FROM portal.reputation_history WHERE user_id IN (SELECT user_id FROM test_user_ids);
DELETE FROM auth.user_sessions WHERE auth_user_id IN (SELECT auth_user_id FROM test_user_ids);
DELETE FROM portal.users WHERE user_id IN (SELECT user_id FROM test_user_ids);
DELETE FROM auth.users WHERE auth_user_id IN (SELECT auth_user_id FROM test_user_ids);

DROP TABLE test_user_ids;
