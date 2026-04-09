const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");

// Get user notifications
exports.getNotifications = catchAsync(async (req, res) => {
    // Directly use portal_user_id from the authenticated user object
    const portalUserId = req.user.portal_user_id;

    if (!portalUserId) {
      throw new Error("User not found");
    }

    const notifications = await pool.query(
      `WITH DedupedNotifications AS (
         SELECT n.*,
                ROW_NUMBER() OVER(PARTITION BY n.message, n.related_id, n.related_type ORDER BY n.created_at DESC) as rn
         FROM portal.notifications n
         WHERE n.user_id = $1
       )
       SELECT n.* FROM DedupedNotifications n
       WHERE n.rn = 1
         AND NOT EXISTS (
           SELECT 1 FROM portal.discussions d 
           WHERE d.discussion_id = n.related_id AND n.related_type = 'discussion' 
             AND (d.deleted_at IS NOT NULL OR d.is_deleted = TRUE)
         )
         AND NOT EXISTS (
           SELECT 1 FROM portal.discussion_comments dc 
           WHERE dc.comment_id = n.related_id AND n.related_type = 'comment' 
             AND (dc.deleted_at IS NOT NULL OR dc.is_deleted = TRUE)
         )
         AND NOT EXISTS (
           SELECT 1 FROM portal.resources r 
           WHERE r.resource_id = n.related_id AND n.related_type = 'resource' 
             AND r.deleted_at IS NOT NULL
         )
         AND NOT EXISTS (
           SELECT 1 FROM portal.study_groups g 
           WHERE g.group_id = n.related_id AND n.related_type = 'group' 
             AND g.deleted_at IS NOT NULL
         )
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [portalUserId],
    );

    res.json(notifications.rows);
});

// Mark notification as read
exports.markRead = catchAsync(async (req, res) => {
    const { id } = req.params;

    // Directly use portal_user_id from the authenticated user object
    const portalUserId = req.user.portal_user_id;

    if (!portalUserId) {
      throw new Error("User not found");
    }

    await pool.query(
      `UPDATE portal.notifications
       SET is_read = TRUE
       WHERE notification_id = $1 AND user_id = $2`,
      [id, portalUserId],
    );

    res.json({ message: "Notification marked as read" });
});

// Delete a specific notification
exports.deleteNotification = catchAsync(async (req, res) => {
    const { id } = req.params;

    const portalUserId = req.user.portal_user_id;
    if (!portalUserId) {
      throw new Error("User not found");
    }

    await pool.query(
      `DELETE FROM portal.notifications
       WHERE notification_id = $1 AND user_id = $2`,
      [id, portalUserId],
    );

    res.json({ message: "Notification deleted successfully" });
});

// Clear all notifications for the user
exports.clearAll = catchAsync(async (req, res) => {
    const portalUserId = req.user.portal_user_id;
    if (!portalUserId) {
      throw new Error("User not found");
    }

    await pool.query(
      `DELETE FROM portal.notifications
       WHERE user_id = $1`,
      [portalUserId],
    );

    res.json({ message: "All notifications cleared" });
});
