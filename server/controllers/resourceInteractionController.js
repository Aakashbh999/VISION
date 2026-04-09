const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");

// Record interaction
exports.interactWithResource = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { type } = req.body;

    // Directly use portal_user_id from the authenticated user object
    const portalUserId = req.user.portal_user_id;

    if (!portalUserId) {
      throw new Error("Portal user not found");
    }

    if (["bookmark", "like", "dislike", "complete"].includes(type)) {
      await pool.query(
        `INSERT INTO portal.user_resource_interactions
         (user_id, resource_id, interaction_type)
         VALUES ($1,$2,$3)
         ON CONFLICT DO NOTHING`,
        [portalUserId, id, type],
      );
    } else {
      // view & click \u2192 allow multiple records
      await pool.query(
        `INSERT INTO portal.user_resource_interactions
         (user_id, resource_id, interaction_type)
         VALUES ($1,$2,$3)`,
        [portalUserId, id, type],
      );
    }

    res.json({ message: "Interaction recorded" });
});
