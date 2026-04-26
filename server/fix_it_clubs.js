require('dotenv').config();
const pool = require('./config/db');

async function fix() {
  try {
    console.log("Fixing is_public in it_clubs...");
    // First, update anything that isn't 'true' or 'false' to 'true'
    await pool.query(`UPDATE portal.it_clubs SET is_public = 'true' WHERE is_public IS NULL OR is_public NOT IN ('true', 'false')`);
    // Now convert type
    await pool.query(`ALTER TABLE portal.it_clubs ALTER COLUMN is_public TYPE BOOLEAN USING (is_public::boolean)`);
    // Ensure default is true
    await pool.query(`ALTER TABLE portal.it_clubs ALTER COLUMN is_public SET DEFAULT true`);
    console.log("Done!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
fix();
