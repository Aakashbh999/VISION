require('dotenv').config();
const pool = require('./config/db');

async function runMigration() {
  try {
    console.log("Adding is_public column to job_market_insights...");

    await pool.query('ALTER TABLE job_market_insights ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;');
    console.log("Added to job_market_insights");

    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    pool.end();
  }
}

runMigration();
