const pool = require("../config/db");

exports.getFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const finalLimit = Math.min(limit, 100);

    const feed = await pool.query(
      `SELECT af.*, u.full_name AS actor_name
       FROM portal.activity_feed af
       JOIN portal.users u ON u.user_id = af.actor_user_id
       ORDER BY 
         CASE WHEN af.action_type = 'boost' AND af.created_at > NOW() - INTERVAL '24 hours' THEN 0 ELSE 1 END ASC,
         af.created_at DESC
       LIMIT $1`,
       [finalLimit]
    );

    res.json(feed.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activity feed" });
  }
};
