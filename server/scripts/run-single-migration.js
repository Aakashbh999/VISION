const pool = require("./config/db");
const fs = require("fs");
const path = require("path");

async function runMigration(filename) {
  const client = await pool.connect();

  try {
    console.log(`\n🚀 Running migration: ${filename}\n`);

    const filePath = path.join(__dirname, "db", "migrations", filename);
    const sql = fs.readFileSync(filePath, "utf8");

    await client.query("BEGIN");
    await client.query(sql);
    await client.query("COMMIT");

    console.log("✅ Migration completed successfully!\n");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.error("Usage: node run-single-migration.js <migration-file>");
  process.exit(1);
}

runMigration(migrationFile);
