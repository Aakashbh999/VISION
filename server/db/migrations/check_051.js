const pool = require("../../config/db");
async function check() {
  const c = await pool.connect();
  try {
    const r = await c.query(`
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema = 'portal' AND table_name = 'resource_tags'
      ORDER BY ordinal_position`);
    console.log("resource_tags columns:", r.rows.map(x => `${x.column_name}(${x.data_type})`).join(", "));
  } finally { c.release(); await pool.end(); }
}
check().catch(e => { console.error(e.message); process.exit(1); });
