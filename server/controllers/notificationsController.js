/**
 * Notifications Controller
 * Manages user notification delivery, reading status, and cleanup.
 * Supports pagination, filtering, and bulk operations.
 *
 * Features:
 * - Notification retrieval with pagination (default 20, max 50 per page)
 * - Unread-only filtering
 * - Time-based filtering (last N days)
 * - Read status tracking and marking
 * - Bulk mark-as-read for all notifications
 * - Individual notification deletion
 * - Bulk cleanup (clear all notifications)
 * - Notification type inference from activity metadata
 */

const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

exports.getNotifications = catchAsync(async (req, res) => {
  const portalUserId = req.user.portal_user_id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const unreadOnly = req.query.unreadOnly === "true";
  const parsedSinceDays = parseInt(req.query.sinceDays, 10);
  const sinceDays =
    Number.isInteger(parsedSinceDays) && parsedSinceDays > 0
      ? parsedSinceDays
      : null;

  const notifications = await pool.query(
    `WITH base_notifications AS (
         SELECT
           n.notification_id,
           n.user_id,
           n.actor_user_id,
           n.type,
           n.title,
           n.message,
           n.related_type,
           n.related_id,
           n.reference_type,
           n.reference_id,
           COALESCE(n.related_type, n.reference_type) AS target_type,
           COALESCE(n.related_id, n.reference_id) AS target_id,
           n.is_read,
           n.created_at
         FROM portal.notifications n
         WHERE n.user_id = $1
            AND ($4::boolean = FALSE OR n.is_read = FALSE)
            AND ($5::int IS NULL OR n.created_at >= NOW() - ($5::int * INTERVAL '1 day'))
            AND (n.type != 'group_invite' OR EXISTS (
                SELECT 1 FROM portal.group_invitations gi
                WHERE gi.invitation_id = n.related_id
                  AND gi.status = 'pending'
                  AND gi.expires_at > NOW()
            ))
       ),
       deduped_notifications AS (
         SELECT
           bn.*,
           ROW_NUMBER() OVER(
             PARTITION BY bn.message, bn.target_id, bn.target_type
             ORDER BY bn.created_at DESC
           ) AS rn,
           COUNT(*) OVER() AS total_count
         FROM base_notifications bn
       )
       SELECT
         n.notification_id,
         n.user_id,
         n.actor_user_id,
         actor.full_name AS actor_name,
         n.type,
         n.title,
         n.message,
         n.related_type,
         n.related_id,
         n.reference_type,
         n.reference_id,
         n.target_type,
         n.target_id,
         CASE
           WHEN n.target_type = 'comment' AND c.discussion_id IS NOT NULL AND n.target_id IS NOT NULL
             THEN '/discussions/' || c.discussion_id::text || '#comment-' || n.target_id::text
           WHEN n.target_type = 'discussion' AND n.target_id IS NOT NULL
             THEN '/discussions/' || n.target_id::text
           WHEN n.target_type = 'group' AND n.target_id IS NOT NULL
             THEN '/groups/' || n.target_id::text
           WHEN n.target_type = 'user' AND n.target_id IS NOT NULL
             THEN '/profile/' || n.target_id::text
           WHEN n.target_type = 'resource'
             THEN '/resources'
           WHEN n.type = 'new_student_pending'
             THEN '/admin/pending'
           WHEN n.type = 'new_resource_pending'
             THEN '/admin/resources/pending'
           ELSE NULL
         END AS route_path,
         n.is_read,
         n.created_at,
         d.discussion_id,
         d.title AS discussion_title,
         c.comment_id,
         LEFT(COALESCE(c.content, ''), 80) AS comment_preview,
         c.discussion_id AS comment_discussion_id,
         r.resource_id,
         r.title AS resource_title,
         g.group_id,
         g.name AS group_name,
         n.total_count
       FROM deduped_notifications n
       LEFT JOIN portal.users actor ON actor.user_id = n.actor_user_id
       LEFT JOIN portal.discussion_comments c
         ON n.target_type = 'comment' AND c.comment_id = n.target_id
       LEFT JOIN portal.discussions d
         ON (
           (n.target_type = 'discussion' AND d.discussion_id = n.target_id)
           OR (n.target_type = 'comment' AND d.discussion_id = c.discussion_id)
         )
       LEFT JOIN portal.resources r
         ON n.target_type = 'resource' AND r.resource_id = n.target_id
        LEFT JOIN portal.group_invitations i
          ON n.type = 'group_invite' AND i.invitation_id = n.related_id
        LEFT JOIN portal.study_groups g
          ON (n.target_type = 'group' AND g.group_id = n.target_id)
          OR (n.type = 'group_invite' AND g.group_id = i.group_id)
       WHERE n.rn = 1
         AND NOT EXISTS (
           SELECT 1 FROM portal.discussions d
           WHERE d.discussion_id = n.target_id AND n.target_type = 'discussion'
             AND (d.deleted_at IS NOT NULL OR d.is_deleted = TRUE)
         )
         AND NOT EXISTS (
           SELECT 1 FROM portal.discussion_comments dc
           WHERE dc.comment_id = n.target_id AND n.target_type = 'comment'
             AND (dc.deleted_at IS NOT NULL OR dc.is_deleted = TRUE)
         )
         AND NOT EXISTS (
           SELECT 1 FROM portal.resources r
           WHERE r.resource_id = n.target_id AND n.target_type = 'resource'
             AND r.deleted_at IS NOT NULL
         )
         AND NOT EXISTS (
           SELECT 1 FROM portal.study_groups g
           WHERE g.group_id = n.target_id AND n.target_type = 'group'
             AND g.deleted_at IS NOT NULL
         )
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
    [portalUserId, limit, offset, unreadOnly, sinceDays],
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

exports.markRead = catchAsync(async (req, res) => {
  const { id } = req.params;

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

exports.markAllRead = catchAsync(async (req, res) => {
  const portalUserId = req.user.portal_user_id;
  if (!portalUserId) {
    throw createError(401, "User not found");
  }

  const result = await pool.query(
    `UPDATE portal.notifications
       SET is_read = TRUE
       WHERE user_id = $1 AND is_read = FALSE`,
    [portalUserId],
  );

  res.json({
    message: "All notifications marked as read",
    updated_count: result.rowCount || 0,
  });
});

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
