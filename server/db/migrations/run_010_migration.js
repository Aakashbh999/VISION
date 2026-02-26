// Run migration to add role column
const pool = require("../../config/db");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, "010_add_role_column.sql");
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("Running migration: 010_add_role_column.sql");
    await pool.query(sql);
    console.log("✅ Migration completed successfully!");

    // Verify the column was added
    const result = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' 
      AND table_name = 'users' 
      AND column_name = 'role'
    `);

    if (result.rows.length > 0) {
      console.log("✅ Role column verified:", result.rows[0]);
    } else {
      console.log("⚠️ Role column not found after migration");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runMigration();
