const pool = require("../config/db");

exports.getFeed = async (req, res) => {
  try {
    const feed = await pool.query(
      `SELECT af.*, u.full_name AS actor_name
       FROM portal.activity_feed af
       JOIN portal.users u ON u.user_id = af.actor_user_id
       ORDER BY af.created_at DESC
       LIMIT 50`,
    );

    res.json(feed.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activity feed" });
  }
};
