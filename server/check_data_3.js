const pool = require("./config/db");
async function check() {
  try {
    const res = await pool.query("SELECT * FROM portal.user_roadmap_progress LIMIT 10");
    console.log("Roadmap Progress Samples:", res.rows);
    
    const count = await pool.query("SELECT verification_status, COUNT(*) FROM portal.user_roadmap_progress GROUP BY verification_status");
    console.log("Status Counts:", count.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
