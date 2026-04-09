const pool = require("../../config/db");
const fs   = require("fs");
const path = require("path");

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, "052_audit_fixes.sql"), "utf8");
  const client = await pool.connect();
  try {
    console.log("🚀 Running 052_audit_fixes.sql …");
    await client.query(sql);
    console.log("✅ Migration 052 completed.");

    // Verify UNIQUE constraint was added
    const r = await client.query(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_schema = 'portal' AND table_name = 'resource_tags'
        AND constraint_type = 'UNIQUE'`);
    console.log("resource_tags UNIQUE constraints:", r.rows.map(x => x.constraint_name).join(", ") || "NONE");

    // Verify tags duplicate constraint dropped
    const t = await client.query(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_schema = 'portal' AND table_name = 'tags'
        AND constraint_type = 'UNIQUE'`);
    console.log("portal.tags UNIQUE constraints:", t.rows.map(x => x.constraint_name).join(", "));

    // Verify notification index
    const i = await client.query(`
      SELECT indexname FROM pg_indexes
      WHERE schemaname = 'portal' AND tablename = 'notifications'`);
    console.log("notifications indexes:", i.rows.map(x => x.indexname).join(", "));

  } catch (err) {
    console.error("❌ Migration 052 failed:", err.message, err.detail || "");
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}
run();
