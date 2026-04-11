const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

// Get user notifications (paginated)
exports.getNotifications = catchAsync(async (req, res) => {
  const portalUserId = req.user.portal_user_id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const unreadOnly = req.query.unreadOnly === "true";

  const notifications = await pool.query(
    `WITH DedupedNotifications AS (
         SELECT
           n.notification_id,
           n.user_id,
           n.actor_user_id,
           n.type,
           n.title,
           n.message,
           n.related_type,
           n.related_id,
           n.is_read,
           n.created_at,
           ROW_NUMBER() OVER(
             PARTITION BY n.message, n.related_id, n.related_type
             ORDER BY n.created_at DESC
           ) AS rn,
           COUNT(*) OVER() AS total_count
         FROM portal.notifications n
         WHERE n.user_id = $1
           AND ($4::boolean = FALSE OR n.is_read = FALSE)
       )
       SELECT * FROM DedupedNotifications n
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
       LIMIT $2 OFFSET $3`,
    [portalUserId, limit, offset, unreadOnly],
  );

  const total = notifications.rows[0]?.total_count ?? 0;
  res.json({
    data: notifications.rows.map(({ total_count, rn, ...n }) => n),
    pagination: {
      page,
      limit,
      total: parseInt(total),
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

// Mark notification as read
exports.markRead = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Directly use portal_user_id from the authenticated user object
  const portalUserId = req.user.portal_user_id;

  if (!portalUserId) {
    throw createError(401, "User not found");
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
    throw createError(401, "User not found");
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
    throw createError(401, "User not found");
  }

  await pool.query(
    `DELETE FROM portal.notifications
       WHERE user_id = $1`,
    [portalUserId],
  );

  res.json({ message: "All notifications cleared" });
});
