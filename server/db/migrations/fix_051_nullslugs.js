const pool = require("../../config/db");

const SYSTEM_SLUGS = [
  "web-development","mobile-development","machine-learning","data-science",
  "database","security","devops","cloud-computing","algorithms","project-help",
  "career-advice","interview-prep","study-tips","internship","open-source",
];

async function fix() {
  const client = await pool.connect();
  try {
    // Also catch tags with NULL slugs that are wrongly typed as system
    const r = await client.query(
      `UPDATE portal.tags
       SET tag_type = 'custom'
       WHERE tag_type = 'system'
         AND (slug IS NULL OR slug NOT IN (${SYSTEM_SLUGS.map((_, i) => `$${i + 1}`).join(",")}))
       RETURNING name, slug`,
      SYSTEM_SLUGS
    );
    console.log(`Demoted ${r.rows.length} tags:`, r.rows.map(x => x.name).join(", ") || "none");

    const t = await client.query(
      `SELECT COUNT(*) FILTER(WHERE tag_type='system') AS s,
              COUNT(*) FILTER(WHERE tag_type='custom') AS c
       FROM portal.tags`
    );
    console.log(`✅ Done: ${t.rows[0].s} system | ${t.rows[0].c} custom`);
  } finally {
    client.release();
    await pool.end();
  }
}
fix().catch(e => { console.error(e.message); process.exit(1); });
