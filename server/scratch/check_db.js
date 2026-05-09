const pool = require("../config/db");

async function check() {
  try {
    const user_id = 1; // I'll try to find a real user id if possible, but let's check the tables first
    
    console.log("--- Program Roadmaps ---");
    const prRes = await pool.query("SELECT * FROM portal.program_roadmaps");
    console.table(prRes.rows);

    console.log("--- Roadmaps ---");
    const rRes = await pool.query("SELECT roadmap_id, title, is_active FROM portal.roadmaps");
    console.table(rRes.rows);

    console.log("--- User Info ---");
    const uRes = await pool.query("SELECT user_id, program_id FROM portal.users LIMIT 5");
    console.table(uRes.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
