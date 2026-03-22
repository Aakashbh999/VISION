const pool = require("../config/db");

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    // Directly use portal_user_id from the authenticated user object
    const portalUserId = req.user.portal_user_id;

    if (!portalUserId) {
      return res.status(404).json({ error: "User not found" });
    }

    const notifications = await pool.query(
      `SELECT * FROM portal.notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [portalUserId],
    );

    res.json(notifications.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Mark notification as read
exports.markRead = async (req, res) => {
  const { id } = req.params;

  try {
    // Directly use portal_user_id from the authenticated user object
    const portalUserId = req.user.portal_user_id;

    if (!portalUserId) {
      return res.status(404).json({ error: "User not found" });
    }

    await pool.query(
      `UPDATE portal.notifications
       SET is_read = TRUE
       WHERE notification_id = $1 AND user_id = $2`,
      [id, portalUserId],
    );

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notification" });
  }
};
