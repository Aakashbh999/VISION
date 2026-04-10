const pool = require("../../config/db");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const client = await pool.connect();
  try {
    const filePath = path.join(__dirname, "054_sync_vote_scores.sql");
    const sql = fs.readFileSync(filePath, "utf8");
    
    console.log("🚀 Running Migration 054: Sync Vote Scores...");
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("✅ Migration 054 completed successfully!");
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("❌ Migration 054 failed:", err.message);
  } finally {
    if (client) client.release();
    process.exit();
  }
}

runMigration();
