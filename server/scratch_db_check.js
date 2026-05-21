const pool = require("./config/db");
async function check() {
  try {
    const steps = await pool.query("SELECT step_id, roadmap_id, title FROM portal.roadmap_steps ORDER BY roadmap_id, step_order;");
    console.log("Steps:", JSON.stringify(steps.rows, null, 2));
    const mappings = await pool.query("SELECT * FROM portal.step_resource_map;");
    console.log("Mappings:", JSON.stringify(mappings.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
