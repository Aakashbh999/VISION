const pool = require('./server/config/db');

async function debugVXP() {
  try {
    // Check recently approved resources and their uploaders' stats
    const approvedRes = await pool.query(`
      SELECT r.resource_id, r.title, r.created_by, r.status,
             u.full_name, us.total_xp, u.reputation_points
      FROM portal.resources r
      JOIN portal.users u ON u.user_id = r.created_by
      LEFT JOIN portal.user_stats us ON us.user_id = r.created_by
      WHERE r.status = 'approved'
      ORDER BY r.resource_id DESC
      LIMIT 10
    `);
    console.log("=== Recently Approved Resources + Uploader Stats ===");
    approvedRes.rows.forEach(r => {
      console.log(`Resource #${r.resource_id}: "${r.title.substring(0,40)}" | Uploader: ${r.full_name} | total_xp: ${r.total_xp} | rep: ${r.reputation_points}`);
    });

    // Check the XP activity log for resource approvals
    const xpLogs = await pool.query(`
      SELECT log_id, user_id, amount, reason, new_total, new_level, created_at
      FROM portal.xp_activity_log
      WHERE reason LIKE 'Resource approved%'
      ORDER BY created_at DESC
      LIMIT 20
    `);
    console.log("\n=== XP Activity Log (Resource Approvals) ===");
    if (xpLogs.rows.length === 0) {
      console.log("NO resource approval XP logs found!");
    } else {
      xpLogs.rows.forEach(l => {
        console.log(`log #${l.log_id}: user ${l.user_id} | +${l.amount} XP | reason: "${l.reason}" | new_total: ${l.new_total} | at: ${l.created_at}`);
      });
    }

    // Check all recent XP logs
    const allLogs = await pool.query(`
      SELECT log_id, user_id, amount, reason, new_total, created_at
      FROM portal.xp_activity_log
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log("\n=== All Recent XP Activity Logs ===");
    if (allLogs.rows.length === 0) {
      console.log("NO XP logs at all!");
    } else {
      allLogs.rows.forEach(l => {
        console.log(`log #${l.log_id}: user ${l.user_id} | ${l.amount} XP | reason: "${l.reason}" | at: ${l.created_at}`);
      });
    }

    // Check reason column length
    console.log("\n=== xp_activity_log reason column ===");
    const colInfo = await pool.query(`
      SELECT column_name, character_maximum_length, data_type
      FROM information_schema.columns
      WHERE table_schema = 'portal'
        AND table_name = 'xp_activity_log'
        AND column_name = 'reason'
    `);
    console.log("reason column:", colInfo.rows[0]);

    // Check user_stats for all users
    console.log("\n=== User Stats ===");
    const statsRes = await pool.query(`
      SELECT us.user_id, u.full_name, us.total_xp, us.current_level, u.reputation_points
      FROM portal.user_stats us
      JOIN portal.users u ON u.user_id = us.user_id
      ORDER BY us.user_id
    `);
    statsRes.rows.forEach(s => {
      console.log(`User #${s.user_id} (${s.full_name}): XP=${s.total_xp}, Level=${s.current_level}, Rep=${s.reputation_points}`);
    });

  } catch (err) {
    console.error("Error:", err.message);
    console.error(err.stack);
  } finally {
    pool.end();
  }
}

debugVXP();
