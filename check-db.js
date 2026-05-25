const pool = require('./server/config/db');

async function checkLogs() {
  try {
    console.log("Checking last 5 XP logs:");
    const logs = await pool.query(
      `SELECT log_id, user_id, amount, reason, created_at 
       FROM portal.xp_activity_log 
       ORDER BY created_at DESC 
       LIMIT 5`
    );
    console.table(logs.rows);

    console.log("Checking resources status:");
    const res = await pool.query(
      `SELECT resource_id, title, status, uploader_id 
       FROM portal.resources 
       ORDER BY resource_id DESC 
       LIMIT 5`
    );
    console.table(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
checkLogs();
