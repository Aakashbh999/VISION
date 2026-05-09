const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runUpdates() {
  const client = await pool.connect();
  try {
    console.log('--- Starting Database Cleanup & Updates ---');

    // 1. Remove all old groups
    console.log('1. Deleting all study groups...');
    const delGroups = await client.query('DELETE FROM portal.study_groups');
    console.log(`   Done. Deleted ${delGroups.rowCount} groups.`);

    // 2. Update Aakash Bhandari's XP and Reputation
    console.log('2. Updating Aakash Bhandari (bhandariaakash000@gmail.com)...');
    const userRes = await client.query(
      `SELECT p.user_id 
       FROM portal.users p
       JOIN auth.users a ON p.auth_user_id = a.auth_user_id
       WHERE a.email = $1`,
      ['bhandariaakash000@gmail.com']
    );

    if (userRes.rows.length > 0) {
      const userId = userRes.rows[0].user_id;
      
      // Update stats (total_xp)
      await client.query(
        'UPDATE portal.user_stats SET total_xp = 1000, current_level = 10 WHERE user_id = $1',
        [userId]
      );
      
      // Update profile (reputation_points + full_name)
      await client.query(
        'UPDATE portal.users SET reputation_points = 1000, full_name = $1 WHERE user_id = $2',
        ['Aakash Bhandari', userId]
      );
      
      console.log(`   Done. Updated stats and profile for User ID: ${userId}`);
    } else {
      console.log('   Warning: User bhandariaakash000@gmail.com not found.');
    }

    // 3. Rename "test user" to "Admin"
    console.log('3. Renaming "test user" to "Admin"...');
    const renameRes = await client.query(
      "UPDATE portal.users SET full_name = 'Admin' WHERE full_name ILIKE '%test user%' OR full_name = 'test user' RETURNING user_id"
    );
    if (renameRes.rowCount > 0) {
      console.log(`   Done. Renamed ${renameRes.rowCount} user(s) to Admin.`);
    } else {
      console.log('   Note: No users found with name "test user".');
    }

    console.log('--- All Updates Completed Successfully ---');
  } catch (err) {
    console.error('Error during updates:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runUpdates();
