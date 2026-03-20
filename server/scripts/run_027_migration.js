const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

async function runMigration() {
  const migrationPath = path.join(__dirname, 'db/migrations/027_add_vote_type_to_likes.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    console.log("Running Vote Type migration...");
    await pool.query(sql);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

runMigration();
