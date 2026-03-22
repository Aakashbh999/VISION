const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runMigration() {
  const migrationPath = path.join(__dirname, 'db/migrations/026_reporting_and_discussion_upgrades.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    console.log("Running Reporting and Discussion Upgrades migration...");
    await pool.query(sql);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

runMigration();
