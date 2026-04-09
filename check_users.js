const pool = require('./server/config/db');

async function checkUsers() {
  try {
    const result = await pool.query(`
      SELECT user_id, full_name, student_status, is_suspended 
      FROM portal.users
    `);
    console.log(JSON.stringify(result.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
