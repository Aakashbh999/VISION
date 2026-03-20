const pool = require("./config/db");

async function showDegrees() {
  try {
    const degrees = await pool.query(
      "SELECT id, degree_code, full_name FROM portal.academic_degrees ORDER BY id",
    );
    console.log("\n🎓 ACADEMIC DEGREES:");
    degrees.rows.forEach((d) => {
      console.log(`   ${d.id}. [${d.degree_code}] ${d.full_name}`);
    });
    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
}

showDegrees();
