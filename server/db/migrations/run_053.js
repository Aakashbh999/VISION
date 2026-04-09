const pool = require("../../config/db");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const fileName = "053_activity_feed_optimization.sql";
  const filePath = path.join(__dirname, fileName);
  const sql = fs.readFileSync(filePath, "utf8");

  console.log(`🚀 Running Migration: ${fileName}...`);
  try {
    await pool.query(sql);
    console.log("✅ Migration completed successfully!");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    process.exit();
  }
}

runMigration();
