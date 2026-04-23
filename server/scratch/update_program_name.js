const pool = require('../config/db');

async function run() {
  try {
    const res = await pool.query("UPDATE portal.programs SET program_name = 'BSc.CSIT' WHERE program_id = 1");
    console.log('Successfully updated Program 1 name to BSc.CSIT');
    console.log('Rows affected:', res.rowCount);
  } catch (err) {
    console.error('Error updating database:', err);
  } finally {
    await pool.end();
  }
}

run();
