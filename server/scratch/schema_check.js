require('dotenv').config();
const pool = require('../config/db');

async function check() {
  try {
    const tables = ['roadmaps', 'roadmap_steps', 'resources', 'step_resource_map'];
    for (const table of tables) {
      console.log(`--- Table: ${table} ---`);
      const res = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'portal' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      console.table(res.rows);
      
      const constraints = await pool.query(`
        SELECT conname, pg_get_constraintdef(c.oid)
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE n.nspname = 'portal' AND conrelid = ('portal.' || $1)::regclass
      `, [table]);
      console.log('Constraints:');
      console.table(constraints.rows);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

check();
