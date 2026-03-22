const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: 'v:/campus/final year project/VISION/server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkGroups() {
  try {
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'portal' AND table_name = 'study_groups'
    `);

    const groups = await pool.query(`
      SELECT group_id, name, is_public, privacy_type 
      FROM portal.study_groups 
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 50
    `);

    const result = {
      columns: columns.rows,
      groups: groups.rows
    };

    fs.writeFileSync('db_check_results.json', JSON.stringify(result, null, 2));
    console.log('Results saved to db_check_results.json');

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkGroups();
