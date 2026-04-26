require('dotenv').config();
const pool = require('./config/db');

async function runMigration() {
  try {
    console.log("Adding rejection_reason column to portal.users...");
    await pool.query('ALTER TABLE portal.users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;');
    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    pool.end();
  }
}

runMigration();
