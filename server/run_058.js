const pool = require("./config/db");
const fs = require("fs");
const path = require("path");

async function run() {
  const file = path.join(__dirname, "db/migrations/058_add_streak_to_user_stats.sql");
  const sql = fs.readFileSync(file, "utf8");
  try {
    await pool.query(sql);
    console.log("✅ Migration 058 applied: current_streak added to user_stats");
  } catch (err) {
    console.error("❌ Migration 058 failed:", err.message);
  } finally {
    await pool.end();
  }
}
run();
