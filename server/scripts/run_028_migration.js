const pool = require("./config/db");
const fs = require("fs");
const path = require("path");

const runMigration = async () => {
  try {
    const migrationPath = path.join(__dirname, "db", "migrations", "028_comment_likes_and_counters.sql");
    const migrationSql = fs.readFileSync(migrationPath, "utf8");

    console.log("🚀 Running migration 028: Comment Likes and Counters...");
    await pool.query(migrationSql);
    console.log("✅ Migration 028 completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration 028 failed:", err);
    process.exit(1);
  }
};

runMigration();
