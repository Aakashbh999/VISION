const pool = require("./config/db");

async function checkUsersColumns() {
  try {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'portal' AND table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log("\n👤 USERS TABLE COLUMNS:");
    cols.rows.forEach((c) =>
      console.log(`   - ${c.column_name} (${c.data_type})`),
    );

    const hasItField = cols.rows.find((c) => c.column_name === "it_field_id");
    const hasDegree = cols.rows.find(
      (c) => c.column_name === "academic_degree_id",
    );

    console.log("\n🔍 REQUIRED COLUMNS FOR DISCUSSIONS:");
    console.log(`   it_field_id: ${hasItField ? "✅" : "❌"}`);
    console.log(`   academic_degree_id: ${hasDegree ? "✅" : "❌"}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
}

checkUsersColumns();
