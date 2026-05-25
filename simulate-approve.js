const pool = require('./server/config/db');

async function simulate() {
  try {
    // 1. Check if user 44 exists
    const userRes = await pool.query("SELECT user_id FROM portal.users WHERE user_id = 44");
    if (!userRes.rows.length) {
       console.log("User 44 not found");
       return;
    }
    const uploaderId = 44;

    // 2. Create a dummy pending resource
    const resInsert = await pool.query(
      `INSERT INTO portal.resources (title, description, resource_type, url, status, created_by)
       VALUES ('Dummy Test Resource', 'Desc', 'link', 'http://test.com', 'pending', $1)
       RETURNING resource_id`,
      [uploaderId]
    );
    const id = resInsert.rows[0].resource_id;
    console.log("Created pending resource:", id);

    // 3. Simulate approveResource logic
    console.log("Approving resource...");
    const resourceRes = await pool.query(
      `UPDATE portal.resources
       SET status = 'approved'
       WHERE resource_id = $1 AND status = 'pending'
       RETURNING resource_id, title, created_by`,
      [id],
    );
    
    if (resourceRes.rowCount === 0) {
      console.log("Failed to update status");
      return;
    }

    const title = resourceRes.rows[0].title;
    console.log("Approved! Title:", title);

    // 4. Simulate VXP logic
    const XPService = require('./server/services/xpService');
    const safeTitle = title.length > 40 ? title.substring(0, 40) + "..." : title;
    
    console.log("Awarding VXP...");
    const xpResult = await XPService.updateUserXP(
      uploaderId,
      50,
      `Resource approved: ${safeTitle} (ID: ${id})`,
      null
    );
    console.log("XP Awarded:", xpResult);

    // 5. Check xp_activity_log
    const logCheck = await pool.query(
      `SELECT * FROM portal.xp_activity_log WHERE user_id = $1 AND reason LIKE 'Resource approved:%' ORDER BY created_at DESC LIMIT 1`,
      [uploaderId]
    );
    console.log("Log Check:", logCheck.rows[0]);

    // 6. Cleanup
    await pool.query("DELETE FROM portal.xp_activity_log WHERE log_id = $1", [logCheck.rows[0].log_id]);
    await pool.query("DELETE FROM portal.resources WHERE resource_id = $1", [id]);
    console.log("Cleaned up dummy data.");

  } catch (e) {
    console.error("Simulation failed:", e);
  } finally {
    pool.end();
  }
}

simulate();
