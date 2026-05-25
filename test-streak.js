const pool = require('./server/config/db');
const XPService = require('./server/services/xpService');

async function testStreak() {
  const userId = 44; // Test user
  try {
    // 1. Manually add activity logs for the last 3 days
    await pool.query("BEGIN");
    
    // Clear old logs for this user to test cleanly
    await pool.query("DELETE FROM portal.xp_activity_log WHERE user_id = $1", [userId]);
    
    console.log("Adding activities for 3 days ago, 2 days ago, and yesterday...");
    const baseDate = new Date();
    baseDate.setUTCHours(0, 0, 0, 0);
    
    for (let i = 3; i >= 1; i--) {
      const d = new Date(baseDate);
      d.setUTCDate(d.getUTCDate() - i);
      await pool.query(
        `INSERT INTO portal.xp_activity_log (user_id, amount, reason, new_total, new_level, created_at)
         VALUES ($1, 10, 'Test Activity', 10, 1, $2)`,
        [userId, d]
      );
    }
    
    let currentStreak = await XPService.computeStreak(userId, pool);
    console.log("Streak computed without today's activity:", currentStreak); // Expected: 0 because today is missing
    
    // Now call updateUserXP, which adds an activity for today
    console.log("\nCalling updateUserXP for today...");
    const res = await XPService.updateUserXP(userId, 10, "Test Today");
    console.log("Result:", res);
    
    currentStreak = await XPService.computeStreak(userId, pool);
    console.log("Streak computed after today's activity:", currentStreak); // Expected: 4
    
    await pool.query("ROLLBACK");
  } catch (e) {
    console.error(e);
    await pool.query("ROLLBACK");
  } finally {
    pool.end();
  }
}

testStreak();
