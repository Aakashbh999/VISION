require('dotenv').config();
const pool = require('./config/db');

async function checkCols() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema='portal' AND table_name='users'");
    console.log(res.rows.map(r => r.column_name));
  } finally {
    pool.end();
  }
}
checkCols();
