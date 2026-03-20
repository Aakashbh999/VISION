/**
 * Runner for migration 022_feature_upgrades.sql
 * Usage: node db/migrations/run_022.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Strip unsupported URI parameters that confuse the pg driver
const rawUrl = process.env.DATABASE_URL || "";
const dbUrl = rawUrl.replace(/[&?]channel_binding=[^&]*/g, "");

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  const client = await pool.connect();
  try {
    const sqlFile = path.join(__dirname, "022_feature_upgrades.sql");
    const sql = fs.readFileSync(sqlFile, "utf8");

    console.log("🚀 Running: 022_feature_upgrades.sql …");
    await client.query(sql);
    console.log("✅ Migration 022 completed successfully!");

    // Quick verification queries
    const checks = [
      {
        label: "degree_id on study_groups",
        sql: `SELECT column_name FROM information_schema.columns WHERE table_schema='portal' AND table_name='study_groups' AND column_name='degree_id'`,
      },
      {
        label: "degree_id on resources",
        sql: `SELECT column_name FROM information_schema.columns WHERE table_schema='portal' AND table_name='resources' AND column_name='degree_id'`,
      },
      {
        label: "status column on resources",
        sql: `SELECT column_name FROM information_schema.columns WHERE table_schema='portal' AND table_name='resources' AND column_name='status'`,
      },
      {
        label: "is_moderator on users",
        sql: `SELECT column_name FROM information_schema.columns WHERE table_schema='portal' AND table_name='users' AND column_name='is_moderator'`,
      },
      {
        label: "is_boosted on discussions",
        sql: `SELECT column_name FROM information_schema.columns WHERE table_schema='portal' AND table_name='discussions' AND column_name='is_boosted'`,
      },
      {
        label: "user_badges table",
        sql: `SELECT table_name FROM information_schema.tables WHERE table_schema='portal' AND table_name='user_badges'`,
      },
      {
        label: "resource_status_type enum",
        sql: `SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE t.typname='resource_status_type' AND n.nspname='portal'`,
      },
    ];

    console.log("\n🔍 Verification:");
    for (const check of checks) {
      const res = await client.query(check.sql);
      const status = res.rows.length > 0 ? "✅" : "❌";
      console.log(`  ${status} ${check.label}`);
    }
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
