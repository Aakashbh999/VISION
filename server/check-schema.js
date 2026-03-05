const pool = require("./config/db");

async function checkSchema() {
  try {
    console.log("\n📊 CHECKING DATABASE SCHEMA...\n");

    // Check discussions table columns
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'portal' AND table_name = 'discussions' 
      ORDER BY ordinal_position
    `);

    console.log("✅ DISCUSSIONS TABLE COLUMNS:");
    columnsResult.rows.forEach((c) => {
      console.log(`   - ${c.column_name} (${c.data_type})`);
    });

    // Check which tables exist
    const tablesResult = await pool.query(`
      SELECT 
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'portal' AND table_name = 'discussion_comments') as has_comments,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'portal' AND table_name = 'discussion_replies') as has_replies,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'portal' AND table_name = 'tags') as has_tags,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'portal' AND table_name = 'discussion_tags') as has_discussion_tags,
        EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'portal' AND table_name = 'saved_discussions') as has_saved
    `);

    console.log("\n🗂️ TABLE EXISTENCE CHECK:");
    const tables = tablesResult.rows[0];
    console.log(
      `   - discussion_comments: ${tables.has_comments ? "✅" : "❌"}`,
    );
    console.log(`   - discussion_replies: ${tables.has_replies ? "✅" : "❌"}`);
    console.log(`   - tags: ${tables.has_tags ? "✅" : "❌"}`);
    console.log(
      `   - discussion_tags: ${tables.has_discussion_tags ? "✅" : "❌"}`,
    );
    console.log(`   - saved_discussions: ${tables.has_saved ? "✅" : "❌"}`);

    // Check if comments column exists in proper table
    if (tables.has_comments) {
      const commentCols = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'portal' AND table_name = 'discussion_comments'
      `);
      console.log("\n💬 DISCUSSION_COMMENTS COLUMNS:");
      commentCols.rows.forEach((c) => console.log(`   - ${c.column_name}`));
    } else if (tables.has_replies) {
      const replyCols = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'portal' AND table_name = 'discussion_replies'
      `);
      console.log("\n💬 DISCUSSION_REPLIES COLUMNS:");
      replyCols.rows.forEach((c) => console.log(`   - ${c.column_name}`));
    }

    console.log("\n✅ Schema check complete!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    process.exit(1);
  }
}

checkSchema();
