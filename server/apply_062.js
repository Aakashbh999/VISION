const pool = require("./config/db");
const fs = require("fs");
const path = require("path");

async function run() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, "db/migrations/062_roadmap_strict_completion.sql"), "utf8");
    await client.query(sql);
    console.log("Migration 062 applied successfully");
  } catch (err) {
    console.error("Migration 062 failed:", err.message);
  } finally {
    client.release();
    process.exit();
  }
}
run();
