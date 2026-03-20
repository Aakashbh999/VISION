const pool = require("../config/db");

exports.getRecommendations = async (req, res) => {
  try {
    const authUserId = req.user.auth_user_id;

    const { portal_user_id: user_id, program_id } = req.user;

    // Clear old cache (older than 6 hours)
    await pool.query(`
      DELETE FROM portal.resource_scores
      WHERE calculated_at < NOW() - INTERVAL '6 hours'
    `);

    // Check if cached recommendations exist
    const cached = await pool.query(
      `SELECT r.resource_id, r.title, r.url, rs.score
       FROM portal.resource_scores rs
       JOIN portal.resources r ON r.resource_id = rs.resource_id
       WHERE rs.user_id = $1
       ORDER BY rs.score DESC
       LIMIT 10`,
      [user_id],
    );

    if (cached.rows.length > 0) {
      return res.json({
        source: "cache",
        recommendations: cached.rows,
      });
    }

    // 🔥 Calculate scores dynamically
    const calculated = await pool.query(
      `
      INSERT INTO portal.resource_scores (user_id, resource_id, score, reason)
      SELECT
        $1 AS user_id,
        r.resource_id,
        
        (
          -- Program match
          CASE WHEN r.program_id = $2 THEN 40 ELSE 0 END
          
          +
          
          -- Tag match
          (
            SELECT COUNT(*) * 10
            FROM portal.resource_tags rt
            JOIN portal.user_interests ui 
              ON ui.tag_id = rt.tag_id
            WHERE rt.resource_id = r.resource_id
            AND ui.user_id = $1
          )
          
          +
          
          -- Popularity
          (
            SELECT COUNT(*) * 2
            FROM portal.user_resource_interactions uri
            WHERE uri.resource_id = r.resource_id
          )
          
          -
          
          -- Already completed penalty
          (
            SELECT COUNT(*) * 50
            FROM portal.user_resource_interactions uri
            WHERE uri.resource_id = r.resource_id
            AND uri.user_id = $1
            AND uri.interaction_type = 'completed'
          )
          
        ) AS score,
        
        'auto_calculated'
        
      FROM portal.resources r
      WHERE r.status = 'approved'
      ON CONFLICT (user_id, resource_id)
      DO UPDATE SET
        score = EXCLUDED.score,
        calculated_at = NOW()
      `,
      [user_id, program_id],
    );

    // Return top results
    const final = await pool.query(
      `SELECT r.resource_id, r.title, r.url, rs.score
       FROM portal.resource_scores rs
       JOIN portal.resources r ON r.resource_id = rs.resource_id
       WHERE rs.user_id = $1
       ORDER BY rs.score DESC
       LIMIT 10`,
      [user_id],
    );

    res.json({
      source: "calculated",
      recommendations: final.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Recommendation failed" });
  }
};
