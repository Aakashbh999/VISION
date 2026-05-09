require('dotenv').config();
const pool = require('./config/db');

async function check() {
  try {
    const res = await pool.query(`
      SELECT table_schema, table_name, column_name 
      FROM information_schema.columns 
      WHERE column_name = 'rejection_reason'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

check();
