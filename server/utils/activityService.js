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
  await pool.query(
    `INSERT INTO portal.notifications
     (user_id, actor_user_id, type, title, message, related_type, related_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [userId, actorId, type, title, message, relatedType, relatedId],
  );
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
  await pool.query(
    `INSERT INTO portal.activity_feed
     (actor_user_id, action_type, reference_type, reference_id, metadata)
     VALUES ($1,$2,$3,$4,$5)`,
    [actorId, actionType, referenceType, referenceId, metadata],
  );
};
