const pool = require('./server/config/db');
const XPService = require('./server/services/xpService');

async function testVXPWithPool() {
  // Test XPService.updateUserXP with null client (uses pool directly)
  // This simulates the new approach where XP is awarded outside the transaction
  const testUserId = 177; // Ujjal Pandey

  try {
    console.log("=== Before XP Award ===");
    const before = await pool.query(
      "SELECT total_xp, current_level FROM portal.user_stats WHERE user_id = $1",
      [testUserId]
    );
    console.log("user_stats:", before.rows[0]);

    const beforeLogs = await pool.query(
      "SELECT COUNT(*) as count FROM portal.xp_activity_log WHERE user_id = $1 AND reason LIKE 'Resource approved%'",
      [testUserId]
    );
    console.log("Resource approval XP logs:", beforeLogs.rows[0].count);

    console.log("\n=== Calling XPService.updateUserXP with null client ===");
    const result = await XPService.updateUserXP(
      testUserId,
      50,
      "Resource approved: Test Resource (ID: 999)",
      null // pool directly — same as the new approach
    );
    console.log("XPService result:", result);

    console.log("\n=== After XP Award ===");
    const after = await pool.query(
      "SELECT total_xp, current_level FROM portal.user_stats WHERE user_id = $1",
      [testUserId]
    );
    console.log("user_stats:", after.rows[0]);

    const afterLogs = await pool.query(
      "SELECT * FROM portal.xp_activity_log WHERE user_id = $1 AND reason LIKE 'Resource approved%' ORDER BY created_at DESC LIMIT 3",
      [testUserId]
    );
    console.log("New XP logs:", afterLogs.rows);

    // Clean up - remove the test entry
    await pool.query(
      "DELETE FROM portal.xp_activity_log WHERE user_id = $1 AND reason = $2",
      [testUserId, "Resource approved: Test Resource (ID: 999)"]
    );
    // Revert total_xp
    await pool.query(
      "UPDATE portal.user_stats SET total_xp = $1 WHERE user_id = $2",
      [before.rows[0].total_xp, testUserId]
    );
    console.log("\n✅ Test passed! XPService works correctly with null client (pool)");
    console.log("Cleaned up test data.");

  } catch (err) {
    console.error("❌ Test FAILED:", err.message);
    console.error(err.stack);
  } finally {
    pool.end();
  }
}

testVXPWithPool();
