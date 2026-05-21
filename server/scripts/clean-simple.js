const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  console.log('Connecting...');
  try {
    await client.connect();
    console.log('Connected!');

    await client.query('SET search_path TO portal, auth, public');
    
    // Find users
    const users = await client.query(`
      SELECT p.user_id, p.auth_user_id, p.full_name, a.email
      FROM portal.users p
      JOIN auth.users a ON p.auth_user_id = a.auth_user_id
      WHERE p.full_name ILIKE '%test%' 
         OR p.full_name ILIKE '%dummy%'
         OR a.email ILIKE '%test%'
         OR a.email ILIKE '%dummy%'
         OR a.email ILIKE '%@vision.local'
    `);

    console.log(`Found ${users.rowCount} test users.`);

    if (users.rowCount > 0) {
      const userIds = users.rows.map(u => u.user_id);
      const authUserIds = users.rows.map(u => u.auth_user_id);

      await client.query('BEGIN');
      
      // Delete comments
      const del1 = await client.query('DELETE FROM portal.discussion_comments WHERE author_id = ANY($1)', [userIds]);
      console.log(`Deleted ${del1.rowCount} comments.`);

      // Delete discussions
      const del2 = await client.query('DELETE FROM portal.discussions WHERE author_id = ANY($1)', [userIds]);
      console.log(`Deleted ${del2.rowCount} discussions.`);

      // Delete resources (except roadmap)
      const del3 = await client.query(`
        DELETE FROM portal.resources 
        WHERE added_by = ANY($1) 
        AND resource_id NOT IN (SELECT resource_id FROM portal.step_resource_map)
      `, [userIds]);
      console.log(`Deleted ${del3.rowCount} resources.`);

      // Delete memberships
      const del4 = await client.query('DELETE FROM portal.group_members WHERE user_id = ANY($1)', [userIds]);
      console.log(`Deleted ${del4.rowCount} memberships.`);

      // Delete user_sessions
      const del5 = await client.query('DELETE FROM auth.user_sessions WHERE auth_user_id = ANY($1)', [authUserIds]);
      console.log(`Deleted ${del5.rowCount} sessions.`);

      // Delete portal users
      const del6 = await client.query('DELETE FROM portal.users WHERE user_id = ANY($1)', [userIds]);
      console.log(`Deleted ${del6.rowCount} portal users.`);

      // Delete auth users
      const del7 = await client.query('DELETE FROM auth.users WHERE auth_user_id = ANY($1)', [authUserIds]);
      console.log(`Deleted ${del7.rowCount} auth users.`);

      await client.query('COMMIT');
      console.log('Cleanup successful!');
    }

  } catch (err) {
    console.error('Error:', err);
    try { await client.query('ROLLBACK'); } catch (e) {}
  } finally {
    await client.end();
  }
}

run();
