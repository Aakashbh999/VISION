const pool = require("./config/db");

async function checkFieldsAndDegrees() {
  try {
    console.log("\n🔍 CHECKING IT FIELDS AND ACADEMIC DEGREES...\n");

    // Check it_fields table
    const fieldsCheck = await pool.query(`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'portal' AND table_name = 'it_fields'
      ) as exists
    `);

    if (fieldsCheck.rows[0].exists) {
      const fields = await pool.query(
        "SELECT * FROM portal.it_fields ORDER BY id",
      );
      console.log(`✅ IT_FIELDS TABLE: ${fields.rowCount} records`);
      fields.rows.forEach((f) =>
        console.log(`   ${f.id}. ${f.name || f.field_name}`),
      );
    } else {
      console.log("❌ IT_FIELDS TABLE: Does not exist");
    }

    // Check academic_degrees table
    const degreesCheck = await pool.query(`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'portal' AND table_name = 'academic_degrees'
      ) as exists
    `);

    if (degreesCheck.rows[0].exists) {
      const degrees = await pool.query(
        "SELECT * FROM portal.academic_degrees ORDER BY id",
      );
      console.log(`\n✅ ACADEMIC_DEGREES TABLE: ${degrees.rowCount} records`);
      degrees.rows.forEach((d) =>
        console.log(`   ${d.id}. ${d.name || d.degree_name}`),
      );
    } else {
      console.log("\n❌ ACADEMIC_DEGREES TABLE: Does not exist");
    }

    // Check what columns they have
    if (fieldsCheck.rows[0].exists) {
      const fieldCols = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'portal' AND table_name = 'it_fields'
      `);
      console.log(
        "\n📋 IT_FIELDS COLUMNS:",
        fieldCols.rows.map((c) => c.column_name).join(", "),
      );
    }

    if (degreesCheck.rows[0].exists) {
      const degreeCols = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'portal' AND table_name = 'academic_degrees'
      `);
      console.log(
        "📋 ACADEMIC_DEGREES COLUMNS:",
        degreeCols.rows.map((c) => c.column_name).join(", "),
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
}

checkFieldsAndDegrees();
