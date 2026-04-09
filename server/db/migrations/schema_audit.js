const pool = require("../../config/db");

async function check() {
  const client = await pool.connect();
  try {
    // Check portal.users columns
    const u = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'portal' AND table_name = 'users'
      ORDER BY ordinal_position`);
    console.log("portal.users cols:", u.rows.map(x => x.column_name).join(", "));

    // Check pg_trgm
    const trgm = await client.query(`
      SELECT extname FROM pg_extension WHERE extname = 'pg_trgm'`);
    console.log("pg_trgm installed:", trgm.rows.length > 0 ? "YES" : "NO");

    // Count key indexes
    const idx = await client.query(`
      SELECT tablename, indexname FROM pg_indexes
      WHERE schemaname IN ('portal','auth')
      ORDER BY tablename, indexname`);
    console.log("\nIndexes:");
    idx.rows.forEach(r => console.log(` ${r.tablename}: ${r.indexname}`));

    // Check if resource_tags table has a unique constraint
    const rt = await client.query(`
      SELECT constraint_name, constraint_type FROM information_schema.table_constraints
      WHERE table_schema = 'portal' AND table_name = 'resource_tags'`);
    console.log("\nresource_tags constraints:", rt.rows.map(r=>r.constraint_name).join(", "));

  } finally {
    client.release();
    await pool.end();
  }
}
check().catch(e => { console.error(e.message); process.exit(1); });
