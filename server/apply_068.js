const pool = require("./config/db");
const fs = require("fs");
const path = require("path");

async function run() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, "db/migrations/068_create_campuses_table.sql"), "utf8");
    await client.query(sql);
    console.log("Migration 068 applied successfully");
  } catch (err) {
    console.error("Migration 068 failed:", err);
  } finally {
    client.release();
    process.exit();
  }
}
run();
