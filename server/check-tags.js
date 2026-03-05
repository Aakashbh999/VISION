const pool = require("./config/db");

async function checkTags() {
  try {
    // Check tags table structure
    const tagsColumns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'portal' AND table_name = 'tags'
      ORDER BY ordinal_position
    `);

    console.log("\n🏷️ TAGS TABLE COLUMNS:");
    tagsColumns.rows.forEach((c) => {
      console.log(`   - ${c.column_name} (${c.data_type})`);
    });

    // Check existing tags
    const existingTags = await pool.query("SELECT * FROM portal.tags LIMIT 5");
    console.log(`\n📊 Existing tags count: ${existingTags.rowCount}`);
    if (existingTags.rowCount > 0) {
      console.log("Sample tags:");
      existingTags.rows.forEach((t) =>
        console.log(`   - ${JSON.stringify(t)}`),
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR:", error.message);
    process.exit(1);
  }
}

checkTags();
