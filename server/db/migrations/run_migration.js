const pool = require("../../config/db");
const fs = require("fs");
const path = require("path");

async function runAllMigrations() {
  // The list of files in exact order of dependency
  const migrationFiles = [
    "001_auth.sql",
    "002_portal_core.sql",
    "003_social.sql",
    "004_roadmap.sql",
    "005_recommendation.sql",
    "006_user_interactions.sql",
    "007_recommendation_engine.sql",
    "008_program_roadmaps.sql",
    "009_groups.sql",
    "010_add_role_column.sql",
    "011_it_reference_tables.sql",
    "012_add_unique_auth_user_constraint.sql",
    "013_password_reset_tokens.sql",
    "014_sync_schema.sql",
  ];

  const client = await pool.connect();

  try {
    await client.query("BEGIN"); // Use a transaction for safety
    console.log("🚀 Starting Database Migrations...");

    for (const file of migrationFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, "utf8");
        console.log(`Running: ${file}`);
        await client.query(sql);
      } else {
        console.warn(`⚠️ Warning: ${file} not found, skipping.`);
      }
    }

    await client.query("COMMIT");
    console.log("✅ All migrations completed successfully!");

    // VERIFICATION: Check for the role column in auth.users (now in 001)
    const res = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'role'
    `);

    if (res.rows.length > 0) {
      console.log("✅ Role column verified in auth.users");
    }
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed! Changes rolled back.", err.message);
  } finally {
    client.release();
    process.exit();
  }
}

runAllMigrations();
