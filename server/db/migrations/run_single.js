const pool = require("../../config/db");
const fs = require("fs");
const path = require("path");

async function runSpecificMigration(filename) {
  const client = await pool.connect();
  try {
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    const sql = fs.readFileSync(filePath, "utf8");
    console.log(`🚀 Running migration: ${filename}...`);
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");
    console.log("✅ Migration completed successfully!");
  } catch (err) {
    if (client) await client.query("ROLLBACK");
    console.error("❌ Migration failed!", err.message);
  } finally {
    if (client) client.release();
    process.exit();
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Please provide a migration filename.");
  process.exit(1);
}

runSpecificMigration(args[0]);
