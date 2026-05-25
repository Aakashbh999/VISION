const pool = require("../config/db");
const logger = require("./logger");

exports.notify = async ({
  userId,
  actorId = null,
  type,
  title,
  message,
  relatedType = null,
  relatedId = null,
}) => {
  if (!userId) return;
  try {
    await pool.query(
      `INSERT INTO portal.notifications
       (user_id, actor_user_id, type, title, message, related_type, related_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, actorId, type, title, message, relatedType, relatedId],
    );
  } catch (err) {
    logger.warn({ err }, "Failed to insert notification");
  }
};

exports.notifyAdmins = async ({
  actorId = null,
  type,
  title,
  message,
  relatedType = null,
  relatedId = null,
}) => {
  try {
    // Insert notification for all users with 'admin' role
    await pool.query(
      `INSERT INTO portal.notifications (user_id, actor_user_id, type, title, message, related_type, related_id)
       SELECT p.user_id, $1, $2, $3, $4, $5, $6
       FROM auth.users a
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       WHERE a.role = 'admin'`,
      [actorId, type, title, message, relatedType, relatedId]
    );
  } catch (err) {
    logger.warn({ err }, "Failed to insert admin notifications");
  }
};

exports.feed = async ({
  actorId,
  actionType,
  referenceType = null,
  referenceId = null,
  metadata = {},
}) => {
  try {
    await pool.query(
      `INSERT INTO portal.activity_feed
       (actor_user_id, action_type, reference_type, reference_id, metadata)
       VALUES ($1,$2,$3,$4,$5)`,
      [actorId, actionType, referenceType, referenceId, metadata],
    );
  } catch (err) {
    logger.warn({ err }, "Failed to insert activity feed entry");
  }
};
