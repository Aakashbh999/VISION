require('dotenv').config();
const pool = require('./config/db');

async function checkColumn() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'portal' 
        AND table_name = 'resources' 
        AND column_name = 'rejection_reason';
    `);
    if (res.rows.length > 0) {
      console.log("Column rejection_reason exists in portal.resources");
    } else {
      console.log("Column rejection_reason does NOT exist in portal.resources");
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

checkColumn();
