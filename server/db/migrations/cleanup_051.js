const pool = require("../../config/db");

/**
 * One-shot cleanup: any tag in portal.tags that is NOT one of the 15
 * authoritative system tags gets demoted to 'custom'.
 * Safe to run multiple times (idempotent).
 */
async function cleanup() {
  const client = await pool.connect();

  const SYSTEM_SLUGS = [
    "web-development",
    "mobile-development",
    "machine-learning",
    "data-science",
    "database",
    "security",
    "devops",
    "cloud-computing",
    "algorithms",
    "project-help",
    "career-advice",
    "interview-prep",
    "study-tips",
    "internship",
    "open-source",
  ];

  try {
    // Demote everything that is NOT in the authoritative set
    const result = await client.query(
      `UPDATE portal.tags
       SET tag_type = 'custom'
       WHERE tag_type = 'system'
         AND slug NOT IN (${SYSTEM_SLUGS.map((_, i) => `$${i + 1}`).join(", ")})
       RETURNING name, slug`,
      SYSTEM_SLUGS,
    );

    if (result.rows.length > 0) {
      console.log(`✅ Demoted ${result.rows.length} incorrectly-classified tags to 'custom':`);
      result.rows.forEach((r) => console.log(`   • ${r.name} (${r.slug})`));
    } else {
      console.log("✅ No rogue system tags found — all clean.");
    }

    // Final tally
    const tally = await client.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE tag_type = 'system') AS system_count,
         COUNT(*) FILTER (WHERE tag_type = 'custom') AS custom_count
       FROM portal.tags`,
    );
    const t = tally.rows[0];
    console.log(`\n📊 Final: ${t.total} total | ${t.system_count} system | ${t.custom_count} custom`);

    // Confirm the 15
    const sys = await client.query(
      `SELECT name FROM portal.tags WHERE tag_type = 'system' ORDER BY name`,
    );
    console.log("\n🏷️  System tags now:");
    sys.rows.forEach((r) => console.log(`   • ${r.name}`));

  } catch (err) {
    console.error("❌ Cleanup failed:", err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
