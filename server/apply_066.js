const pool = require("./config/db");
const fs = require("fs");
const path = require("path");

async function run() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, "db/migrations/066_alter_dob_to_varchar.sql"), "utf8");
    await client.query(sql);
    console.log("Migration 066 applied successfully");
  } catch (err) {
    console.error("Migration 066 failed:", err);
  } finally {
    client.release();
    process.exit();
  }
}
run();
