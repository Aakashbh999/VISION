const pool = require("../../config/db");
const fs = require("fs");
const path = require("path");

async function run060() {
  const file = "060_roadmap_proof_of_work.sql";
  const filePath = path.join(__dirname, file);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    console.log(`🚀 Running migration: ${file}`);

    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, "utf8");
      await client.query(sql);
      console.log(`✅ Success: ${file} completed.`);
    } else {
      throw new Error(`File not found: ${filePath}`);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`❌ Error in ${file}:`, err.message);
  } finally {
    client.release();
    process.exit();
  }
}

run060();
