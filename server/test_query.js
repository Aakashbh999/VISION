const pool = require("./config/db");
async function check() {
  try {
    const result = await pool.query(`
      SELECT urp.*, u.full_name as student_name, rs.title as step_title, r.title as roadmap_title
      FROM portal.user_roadmap_progress urp
      JOIN portal.users u ON urp.user_id = u.user_id
      JOIN portal.roadmap_steps rs ON urp.step_id = rs.step_id
      JOIN portal.roadmaps r ON rs.roadmap_id = r.roadmap_id
      WHERE urp.verification_status = 'pending'
      ORDER BY urp.completed_at DESC
    `);
    console.log("Success! Results count:", result.rowCount);
    process.exit(0);
  } catch (err) {
    console.error("Query Failed:", err);
    process.exit(1);
  }
}
check();
