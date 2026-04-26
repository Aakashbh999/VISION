require('dotenv').config();
const pool = require('./config/db');

async function check() {
  try {
    const tables = ['it_fields', 'academic_degrees', 'job_market_insights', 'it_clubs'];
    for (const t of tables) {
      const res = await pool.query(`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name='${t}' AND column_name='is_public'`);
      console.log(res.rows);
    }
  } finally {
    pool.end();
  }
}
check();
