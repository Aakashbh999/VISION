const pool = require("../config/db");

async function cleanup() {
  console.log("🚀 Starting cleanup of test users and related data...");
  const client = await pool.connect();
  try {
    // Set search path explicitly just in case
    await client.query("SET search_path TO portal, auth, public");
    
    // 1. Find the test users
    const findUsersQuery = `
      SELECT p.user_id, p.auth_user_id, p.full_name, a.email, p.created_at
      FROM portal.users p
      JOIN auth.users a ON p.auth_user_id = a.auth_user_id
      WHERE p.full_name ILIKE '%test%' 
         OR p.full_name ILIKE '%dummy%'
         OR a.email ILIKE '%test%'
         OR a.email ILIKE '%dummy%'
         OR a.email ILIKE '%@vision.local'
      ORDER BY p.created_at DESC
    `;
    
    const usersRes = await client.query(findUsersQuery);
    console.log(`📊 Found ${usersRes.rowCount} candidate test users.`);
    
    if (usersRes.rowCount === 0) {
      console.log("✅ No test users found to remove.");
      return;
    }

    usersRes.rows.forEach(u => {
      console.log(`   - [#${u.user_id}] ${u.full_name} (${u.email}) created at ${u.created_at}`);
    });

    const userIds = usersRes.rows.map(u => u.user_id);
    const authUserIds = usersRes.rows.map(u => u.auth_user_id);

    await client.query("BEGIN");

    // 2. Remove related discussions and comments
    const delComments = await client.query(`DELETE FROM portal.discussion_comments WHERE author_id = ANY($1)`, [userIds]);
    console.log(`🗑️ Deleted ${delComments.rowCount} discussion comments.`);

    const delDiscussions = await client.query(`DELETE FROM portal.discussions WHERE author_id = ANY($1)`, [userIds]);
    console.log(`🗑️ Deleted ${delDiscussions.rowCount} discussions.`);

    // 3. Remove related resources (EXCEPT those used in roadmaps)
    const delResources = await client.query(`
      DELETE FROM portal.resources 
      WHERE added_by = ANY($1) 
      AND resource_id NOT IN (SELECT resource_id FROM portal.step_resource_map)
    `, [userIds]);
    console.log(`🗑️ Deleted ${delResources.rowCount} resources (excluded roadmap resources).`);

    // 4. Remove group memberships
    const delMembers = await client.query(`DELETE FROM portal.group_members WHERE user_id = ANY($1)`, [userIds]);
    console.log(`🗑️ Deleted ${delMembers.rowCount} group memberships.`);
    
    // 5. Remove XP transactions and reputation history
    const delXP = await client.query(`DELETE FROM portal.xp_transactions WHERE user_id = ANY($1)`, [userIds]);
    console.log(`🗑️ Deleted ${delXP.rowCount} XP transactions.`);
    
    const delRep = await client.query(`DELETE FROM portal.reputation_history WHERE user_id = ANY($1)`, [userIds]);
    console.log(`🗑️ Deleted ${delRep.rowCount} reputation history records.`);

    // 6. Remove User Sessions
    const delSessions = await client.query(`DELETE FROM auth.user_sessions WHERE auth_user_id = ANY($1)`, [authUserIds]);
    console.log(`🗑️ Deleted ${delSessions.rowCount} user sessions.`);

    // 7. Remove portal users
    const delPortalUsers = await client.query(`DELETE FROM portal.users WHERE user_id = ANY($1)`, [userIds]);
    console.log(`🗑️ Deleted ${delPortalUsers.rowCount} portal user records.`);

    // 8. Remove auth users
    const delAuthUsers = await client.query(`DELETE FROM auth.users WHERE auth_user_id = ANY($1)`, [authUserIds]);
    console.log(`🗑️ Deleted ${delAuthUsers.rowCount} auth user records.`);

    await client.query("COMMIT");
    console.log("⭐ Cleanup of 30 test users and related data completed successfully!");

  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("❌ Cleanup failed:", err);
    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

cleanup();
