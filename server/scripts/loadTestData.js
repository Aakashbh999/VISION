#!/usr/bin/env node

/**
 * Test Data Loader Script
 *
 * Loads the comprehensive test dataset into the VISION platform
 * for real user experience testing.
 *
 * Usage:
 *   npm run load-test-data
 *   node server/scripts/loadTestData.js
 */

const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[36m",
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function executeSQLFile(filePath) {
  try {
    log(colors.blue, `\n📂 Reading SQL file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const sqlContent = fs.readFileSync(filePath, "utf-8");
    const statements = sqlContent
      .split(/;\s*$/m)
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt && !stmt.startsWith("--"));

    log(colors.bright, `\n📊 Found ${statements.length} SQL statements`);

    let executedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const progress = `[${i + 1}/${statements.length}]`;

      try {
        // Show first 50 chars of statement for context
        const preview = statement.substring(0, 60).replace(/\n/g, " ");
        process.stdout.write(
          `\r${colors.blue}${progress}${colors.reset} Executing: ${preview}...`,
        );

        await pool.query(statement);
        executedCount++;
      } catch (err) {
        errorCount++;
        log(colors.red, `\n❌ Error at statement ${i + 1}: ${err.message}`);
        // Continue with next statement instead of failing
      }
    }

    log(
      colors.green,
      `\n✅ Successfully executed ${executedCount}/${statements.length} statements`,
    );
    if (errorCount > 0) {
      log(
        colors.yellow,
        `⚠️  ${errorCount} statements encountered errors (see above)`,
      );
    }

    return true;
  } catch (err) {
    log(colors.red, `\n❌ Error reading SQL file: ${err.message}`);
    return false;
  }
}

async function verifyData() {
  try {
    log(colors.blue, `\n🔍 Verifying loaded data...`);

    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM portal.users WHERE user_id BETWEEN 1 AND 30) as users,
        (SELECT COUNT(*) FROM portal.resources WHERE created_by BETWEEN 1 AND 30) as resources,
        (SELECT COUNT(*) FROM portal.discussions WHERE user_id BETWEEN 1 AND 30) as discussions,
        (SELECT COUNT(*) FROM portal.user_resource_interactions WHERE user_id BETWEEN 1 AND 30) as interactions,
        (SELECT COUNT(DISTINCT user_id) FROM portal.user_interests WHERE user_id BETWEEN 1 AND 30) as users_with_interests
    `);

    const data = result.rows[0];

    log(colors.bright, "\n📈 Test Data Summary:");
    console.table({
      Users: data.users,
      Resources: data.resources,
      Discussions: data.discussions,
      Interactions: data.interactions,
      "Users with Interests": data.users_with_interests,
    });

    // Verify sample users
    const userSample = await pool.query(`
      SELECT user_id, username, email, program_id 
      FROM portal.users 
      WHERE user_id BETWEEN 1 AND 3 
      ORDER BY user_id
    `);

    log(colors.bright, "\n👥 Sample Test Users:");
    console.table(userSample.rows);

    // Verify by program
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

    log(colors.bright, "\n🎓 Distribution by Program:");
    console.table(programData.rows);

    // Success criteria
    const success =
      data.users >= 30 &&
      data.resources >= 150 &&
      data.discussions >= 150 &&
      data.interactions > 0;

    if (success) {
      log(colors.green, "\n✅ All data loaded successfully!");
    } else {
      log(colors.yellow, "\n⚠️  Some data counts are lower than expected");
    }

    return success;
  } catch (err) {
    log(colors.red, `\n❌ Verification error: ${err.message}`);
    return false;
  }
}

async function showNextSteps() {
  log(colors.bright, "\n🚀 Next Steps:");
  console.log(`
${colors.green}1. Start the backend server:${colors.reset}
   npm run dev
   
${colors.green}2. Start the frontend:${colors.reset}
   cd frontend/my-react-app
   npm run dev
   
${colors.green}3. Access the platform:${colors.reset}
   Frontend: http://localhost:5173
   Backend: http://localhost:5000
   
${colors.green}4. Test with test data:${colors.reset}
   - Browse discussions in the feed
   - View resources
   - Check user profiles
   - Test recommendations
   
${colors.yellow}⚠️  Test data identifiers:${colors.reset}
   - User IDs: 1-30 (sequential)
   - Emails: testuser{id}@example.com
   - Do NOT deploy to production with test data!
  `);
}

async function main() {
  console.clear();
  log(
    colors.bright,
    `
╔════════════════════════════════════════════════════════════╗
║   VISION Test Data Loader - User Experience Testing       ║
║                     May 11, 2026                          ║
╚════════════════════════════════════════════════════════════╝
  `,
  );

  try {
    // Check database connection
    log(colors.blue, "🔗 Checking database connection...");
    const connTest = await pool.query("SELECT version()");
    log(colors.green, "✅ Database connected");

    // Load test data
    const sqlPath = path.join(
      __dirname,
      "../db/test_data_recommendation_engine.sql",
    );
    const loadSuccess = await executeSQLFile(sqlPath);

    if (!loadSuccess) {
      log(colors.red, "\n❌ Failed to load test data");
      process.exit(1);
    }

    // Verify data
    const verifySuccess = await verifyData();

    // Show next steps
    await showNextSteps();

    if (verifySuccess) {
      log(colors.green, "\n✅ Test data setup complete!\n");
      process.exit(0);
    } else {
      log(
        colors.yellow,
        "\n⚠️  Test data partially loaded. Check counts above.\n",
      );
      process.exit(0);
    }
  } catch (err) {
    log(colors.red, `\n❌ Fatal error: ${err.message}\n`);
    process.exit(1);
  }
}

// Run the script
main();
