const pool = require('./server/config/db');

async function checkSchema() {
  try {
    const res = await pool.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_schema = 'portal' AND table_name = 'resources'`
    );
    console.table(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
checkSchema();
