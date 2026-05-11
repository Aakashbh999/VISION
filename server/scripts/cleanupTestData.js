#!/usr/bin/env node

/**
 * Test Data Cleanup Script
 *
 * Safely removes the test dataset from the VISION platform.
 * Preserves all production data.
 *
 * Usage:
 *   npm run load-test-data:cleanup
 *   node server/scripts/cleanupTestData.js
 */

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

async function promptConfirmation() {
  return new Promise((resolve) => {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `${colors.yellow}⚠️  This will DELETE all test data (Users 1-30). Continue? (yes/no): ${colors.reset}`,
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
      },
    );
  });
}

async function cleanup() {
  try {
    log(
      colors.bright,
      `
╔════════════════════════════════════════════════════════════╗
║   VISION Test Data Cleanup - Remove Test Data             ║
║                     May 11, 2026                          ║
╚════════════════════════════════════════════════════════════╝
    `,
    );

    // Check database connection
    log(colors.blue, "🔗 Checking database connection...");
    await pool.query("SELECT version()");
    log(colors.green, "✅ Database connected");

    // Confirm before deleting
    const confirmed = await promptConfirmation();
    if (!confirmed) {
      log(colors.yellow, "\n⏸️  Cleanup cancelled");
      process.exit(0);
    }

    log(colors.yellow, "\n🗑️  Deleting test data...\n");

    // Delete in reverse dependency order
    const deletionSteps = [
      {
        name: "User Resource Interactions",
        query:
          "DELETE FROM portal.user_resource_interactions WHERE user_id BETWEEN 1 AND 30",
      },
      {
        name: "User Interests",
        query:
          "DELETE FROM portal.user_interests WHERE user_id BETWEEN 1 AND 30",
      },
      {
        name: "Resource Tags",
        query: `DELETE FROM portal.resource_tags WHERE resource_id IN (
          SELECT resource_id FROM portal.resources WHERE created_by BETWEEN 1 AND 30
        )`,
      },
      {
        name: "Resources",
        query: "DELETE FROM portal.resources WHERE created_by BETWEEN 1 AND 30",
      },
      {
        name: "Discussions",
        query: "DELETE FROM portal.discussions WHERE user_id BETWEEN 1 AND 30",
      },
      {
        name: "Users",
        query: "DELETE FROM portal.users WHERE user_id BETWEEN 1 AND 30",
      },
    ];

    let totalDeleted = 0;
    for (const step of deletionSteps) {
      const result = await pool.query(step.query);
      const rowCount = result.rowCount || 0;
      totalDeleted += rowCount;
      log(colors.blue, `  ✓ ${step.name}: ${rowCount} rows deleted`);
    }

    log(colors.green, `\n✅ Successfully deleted ${totalDeleted} rows`);

    // Verify cleanup
    log(colors.blue, "\n🔍 Verifying cleanup...");
    const verification = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM portal.users WHERE user_id BETWEEN 1 AND 30) as users,
        (SELECT COUNT(*) FROM portal.resources WHERE created_by BETWEEN 1 AND 30) as resources,
        (SELECT COUNT(*) FROM portal.discussions WHERE user_id BETWEEN 1 AND 30) as discussions,
        (SELECT COUNT(*) FROM portal.user_resource_interactions WHERE user_id BETWEEN 1 AND 30) as interactions
    `);

    const data = verification.rows[0];

    log(colors.bright, "\n📊 Remaining Test Data:");
    console.table({
      Users: data.users,
      Resources: data.resources,
      Discussions: data.discussions,
      Interactions: data.interactions,
    });

    if (data.users === 0 && data.resources === 0 && data.discussions === 0) {
      log(colors.green, "\n✅ All test data successfully removed!\n");
      process.exit(0);
    } else {
      log(
        colors.yellow,
        "\n⚠️  Some test data still exists. Check counts above.\n",
      );
      process.exit(0);
    }
  } catch (err) {
    log(colors.red, `\n❌ Error during cleanup: ${err.message}\n`);
    process.exit(1);
  }
}

// Run the cleanup
cleanup();
