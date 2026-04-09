/**
 * One-shot runner for migration 051_tag_system_overhaul.sql
 * Usage: node run_051.js  (from the server/ directory)
 */
const pool = require("../../config/db");
const fs = require("fs");
const path = require("path");

async function run() {
  const filePath = path.join(__dirname, "051_tag_system_overhaul.sql");
  const sql = fs.readFileSync(filePath, "utf8");

  const client = await pool.connect();
  try {
    console.log("🚀 Running 051_tag_system_overhaul.sql …");
    await client.query(sql);
    console.log("✅ Migration 051 completed successfully.");

    // Quick sanity checks
    const tagType = await client.query(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE tag_type = 'system') AS system_count,
              COUNT(*) FILTER (WHERE tag_type = 'custom') AS custom_count
       FROM portal.tags`
    );
    const row = tagType.rows[0];
    console.log(
      `📊 Tags: ${row.total} total | ${row.system_count} system | ${row.custom_count} custom`
    );

    const rt = await client.query(
      `SELECT COUNT(*) AS backfilled FROM portal.resource_tags`
    );
    console.log(`📊 resource_tags rows: ${rt.rows[0].backfilled}`);

    const systemTags = await client.query(
      `SELECT name, slug FROM portal.tags WHERE tag_type = 'system' ORDER BY name`
    );
    console.log("\n🏷️  System tags:");
    systemTags.rows.forEach((t) => console.log(`   • ${t.name} (${t.slug})`));
  } catch (err) {
    console.error("❌ Migration 051 failed:", err.message);
    console.error(err.detail || "");
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();
