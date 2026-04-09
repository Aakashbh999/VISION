const pool = require("../config/db");

/* ------------------------------
   Create Notification
------------------------------ */
exports.notify = async ({
  userId,
  actorId = null,
  type,
  title,
  message,
  relatedType = null,
  relatedId = null,
}) => {
  if (!userId) return; // guard: skip if no target user
  try {
    await pool.query(
      `INSERT INTO portal.notifications
       (user_id, actor_user_id, type, title, message, related_type, related_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [userId, actorId, type, title, message, relatedType, relatedId],
    );
  } catch (err) {
    console.error("[Notify] Failed to insert notification:", err.message);
  }
};

/* ------------------------------
   Add Activity Feed Entry
------------------------------ */
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
    console.error("[ActivityFeed] Failed to insert feed entry:", err.message);
  }
};
