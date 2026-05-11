#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function loadTestData() {
  try {
    console.log("🔄 Loading complete test dataset...\n");

    const sqlPath = path.join(__dirname, "../db/test_data_full.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    // Split by semicolons and filter out empty statements and comments
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--"));

    console.log(`📊 Found ${statements.length} SQL statements\n`);

    let executedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const progress = `[${i + 1}/${statements.length}]`;

      try {
        const preview = statement.substring(0, 50).replace(/\n/g, " ");
        process.stdout.write(`\r${progress} ${preview}...`);

        await pool.query(statement);
        executedCount++;
      } catch (err) {
        errorCount++;
        console.log(`\n❌ Error at statement ${i + 1}: ${err.message}`);
      }
    }

    console.log(
      `\n\n✅ Successfully executed ${executedCount}/${statements.length} statements`,
    );
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} statements had errors\n`);
    }

    // Verify data
    console.log("\n🔍 Verifying loaded data...\n");

    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM portal.users WHERE user_id BETWEEN 1 AND 30) as users,
        (SELECT COUNT(*) FROM portal.resources WHERE created_by BETWEEN 1 AND 30) as resources,
        (SELECT COUNT(*) FROM portal.discussions WHERE user_id BETWEEN 1 AND 30) as discussions,
        (SELECT COUNT(*) FROM portal.user_resource_interactions WHERE user_id BETWEEN 1 AND 30) as interactions,
        (SELECT COUNT(DISTINCT user_id) FROM portal.user_interests WHERE user_id BETWEEN 1 AND 30) as users_with_interests
    `);

    const data = result.rows[0];

    console.log("📈 Test Data Loaded Successfully:\n");
    console.log(`  ✅ Users: ${data.users}`);
    console.log(`  ✅ Resources: ${data.resources}`);
    console.log(`  ✅ Discussions: ${data.discussions}`);
    console.log(`  ✅ Interactions: ${data.interactions}`);
    console.log(`  ✅ Users with Interests: ${data.users_with_interests}\n`);

    // Show sample users
    const userSample = await pool.query(`
      SELECT user_id, full_name, email, program_id 
      FROM portal.users 
      WHERE user_id BETWEEN 1 AND 3 
      ORDER BY user_id
    `);

    console.log("👥 Sample Test Users:\n");
    console.table(userSample.rows);

    // Show program distribution
    const programData = await pool.query(`
      SELECT 
        p.program_id,
        p.name as program_name,
        COUNT(DISTINCT u.user_id) as user_count,
        COUNT(DISTINCT r.resource_id) as resource_count,
        COUNT(DISTINCT d.discussion_id) as discussion_count
      FROM portal.programs p
      LEFT JOIN portal.users u ON u.program_id = p.program_id AND u.user_id BETWEEN 1 AND 30
      LEFT JOIN portal.resources r ON r.created_by BETWEEN 1 AND 30 AND r.program_id = p.program_id
      LEFT JOIN portal.discussions d ON d.user_id BETWEEN 1 AND 30 AND d.program_id = p.program_id
      WHERE p.program_id IN (1, 2, 3)
      GROUP BY p.program_id, p.name
      ORDER BY p.program_id
    `);

    console.log("🎓 Distribution by Program:\n");
    console.table(programData.rows);

    console.log("\n✅ Test data setup complete!\n");
    console.log("🚀 Next steps:");
    console.log("   1. npm run dev       (Start backend)");
    console.log("   2. npm run dev       (Start frontend in another terminal)");
    console.log("   3. Open http://localhost:5173\n");

    process.exit(0);
  } catch (err) {
    console.error("\n❌ Fatal error:", err.message);
    process.exit(1);
  }
}

loadTestData();
