const { Client } = require("pg");

async function cleanup() {
  const connectionString = "postgresql://neondb_owner:npg_yfV6HDsqC5Wh@ep-billowing-recipe-a1rlsjts.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  console.log("🚀 Attempting connection to direct host...");
  
  try {
    await client.connect();
    console.log("✅ Connected!");

    await client.query("SET search_path TO portal, auth, public");
    
    // Find users
    const usersRes = await client.query(`
      SELECT p.user_id, p.auth_user_id, p.full_name, a.email
      FROM portal.users p
      JOIN auth.users a ON p.auth_user_id = a.auth_user_id
      WHERE p.full_name ILIKE '%test%' 
         OR p.full_name ILIKE '%dummy%'
         OR a.email ILIKE '%test%'
         OR a.email ILIKE '%dummy%'
         OR a.email ILIKE '%@vision.local'
    `);

    console.log(`📊 Found ${usersRes.rowCount} test users.`);

    if (usersRes.rowCount > 0) {
      const userIds = usersRes.rows.map(u => u.user_id);
      const authUserIds = usersRes.rows.map(u => u.auth_user_id);

      console.log("🗑️ Deleting related data...");
      await client.query("BEGIN");
      
      await client.query(`DELETE FROM portal.discussion_comments WHERE author_id = ANY($1)`, [userIds]);
      await client.query(`DELETE FROM portal.discussions WHERE author_id = ANY($1)`, [userIds]);
      await client.query(`DELETE FROM portal.resources WHERE added_by = ANY($1)`, [userIds]);
      await client.query(`DELETE FROM portal.group_members WHERE user_id = ANY($1)`, [userIds]);
      await client.query(`DELETE FROM portal.xp_transactions WHERE user_id = ANY($1)`, [userIds]);
      await client.query(`DELETE FROM portal.reputation_history WHERE user_id = ANY($1)`, [userIds]);
      await client.query(`DELETE FROM auth.user_sessions WHERE auth_user_id = ANY($1)`, [authUserIds]);
      await client.query(`DELETE FROM portal.users WHERE user_id = ANY($1)`, [userIds]);
      await client.query(`DELETE FROM auth.users WHERE auth_user_id = ANY($1)`, [authUserIds]);

      await client.query("COMMIT");
      console.log("⭐ Cleanup successful!");
    } else {
      console.log("✅ Nothing to delete.");
    }

  } catch (err) {
    console.error("❌ Error:", err);
    try { await client.query("ROLLBACK"); } catch(e) {}
  } finally {
    await client.end();
  }
}

cleanup();
