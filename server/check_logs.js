require('dotenv').config();
const pool = require('./config/db');

async function checkLogs() {
  try {
    const res = await pool.query(`
      SELECT * 
      FROM portal.moderation_logs 
      WHERE target_type = 'resource' 
        AND target_id = 74
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkLogs();
