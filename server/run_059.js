const pool = require("./config/db");
const fs = require("fs");
const path = require("path");

async function run() {
  const file = "059_add_soft_delete_to_roadmaps.sql";
  const filePath = path.join(__dirname, "db", "migrations", file);
  
  if (fs.existsSync(filePath)) {
    const sql = fs.readFileSync(filePath, "utf8");
    console.log(`Running: ${file}`);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.log("✅ Migration completed successfully!");
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("❌ Migration failed!", err.message);
    } finally {
      client.release();
      process.exit();
    }
  } else {
    console.error(`❌ Migration file not found at ${filePath}`);
    process.exit(1);
  }
}

run();
