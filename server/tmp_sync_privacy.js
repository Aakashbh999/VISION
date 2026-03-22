const { Pool } = require('pg');
require('dotenv').config({ path: 'v:/campus/final year project/VISION/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function syncPrivacy() {
  try {
    const result = await pool.query(`
      UPDATE portal.study_groups
      SET is_public = (privacy_type != 'private')
      WHERE is_public IS DISTINCT FROM (privacy_type != 'private')
      RETURNING group_id, name, privacy_type, is_public
    `);
    
    console.log(`Synced ${result.rowCount} groups.`);
    if (result.rowCount > 0) {
      console.table(result.rows);
    }

  } catch (err) {
    console.error('Sync failed:', err);
  } finally {
    await pool.end();
  }
}

syncPrivacy();
