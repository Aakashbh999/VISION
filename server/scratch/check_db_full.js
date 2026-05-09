const pool = require("../config/db");

async function check() {
  try {
    console.log("--- All Program Roadmaps ---");
    const prRes = await pool.query("SELECT * FROM portal.program_roadmaps");
    console.table(prRes.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
