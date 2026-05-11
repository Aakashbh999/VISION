const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

const VALID_INTERACTION_TYPES = [
  "bookmark",
  "like",
  "dislike",
  "complete",
  "view",
  "click",
];
const UNIQUE_TYPES = ["bookmark", "like", "dislike", "complete"];

exports.interactWithResource = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;

  const portalUserId = req.user.portal_user_id;

  if (!portalUserId) {
    throw createError(401, "Portal user not found");
  }

  if (!VALID_INTERACTION_TYPES.includes(type)) {
    return res
      .status(400)
      .json({
        error: `Invalid interaction type. Allowed: ${VALID_INTERACTION_TYPES.join(", ")}`,
      });
  }

  if (UNIQUE_TYPES.includes(type)) {

    const existing = await pool.query(
      `SELECT id FROM portal.user_resource_interactions
         WHERE user_id = $1 AND resource_id = $2 AND interaction_type = $3`,
      [portalUserId, id, type],
    );

    if (existing.rows.length > 0) {
      await pool.query(
        `DELETE FROM portal.user_resource_interactions
           WHERE user_id = $1 AND resource_id = $2 AND interaction_type = $3`,
        [portalUserId, id, type],
      );
      return res.json({ message: "Interaction removed", toggled: false });
    }

    await pool.query(
      `INSERT INTO portal.user_resource_interactions
         (user_id, resource_id, interaction_type)
         VALUES ($1, $2, $3)
         ON CONFLICT ON CONSTRAINT unique_user_resource_action DO NOTHING`,
      [portalUserId, id, type],
    );
  } else {

    await pool.query(
      `INSERT INTO portal.user_resource_interactions
         (user_id, resource_id, interaction_type)
         VALUES ($1, $2, $3)`,
      [portalUserId, id, type],
    );
  }

  res.json({ message: "Interaction recorded", toggled: true });
});
