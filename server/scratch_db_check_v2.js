const pool = require("./config/db");
async function check() {
  try {
    const steps = await pool.query("SELECT roadmap_id, step_id, title FROM portal.roadmap_steps WHERE roadmap_id IN (1, 2) ORDER BY roadmap_id, step_order;");
    console.log("Steps 1&2:", JSON.stringify(steps.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
