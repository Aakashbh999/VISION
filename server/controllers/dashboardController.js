const pool = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const authUserId = req.user.auth_user_id;

    // Get portal user + degree
    const userRes = await pool.query(
      `SELECT user_id, program_id, academic_degree_id
       FROM portal.users
       WHERE auth_user_id = $1`,
      [authUserId],
    );

    if (userRes.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const { user_id, program_id, academic_degree_id } = userRes.rows[0];

    // =====================================================
    // 1️⃣ ROADMAP PROGRESS
    // =====================================================
    const progressRes = await pool.query(
      `SELECT
          COALESCE(
            COUNT(*) FILTER (WHERE urp.is_completed = TRUE) * 100.0 /
            NULLIF(COUNT(rs.step_id), 0), 0
          ) AS percent
       FROM portal.program_roadmaps pr
       JOIN portal.roadmaps r ON r.roadmap_id = pr.roadmap_id
       JOIN portal.roadmap_steps rs ON rs.roadmap_id = r.roadmap_id
       LEFT JOIN portal.user_roadmap_progress urp
         ON urp.step_id = rs.step_id AND urp.user_id = $1
       WHERE pr.program_id = $2 AND r.is_active = TRUE`,
      [user_id, program_id],
    );
    const progress = parseFloat(progressRes.rows[0].percent).toFixed(2);

    // =====================================================
    // 2️⃣ NEXT STEP
    // =====================================================
    const nextStepRes = await pool.query(
      `SELECT rs.step_id, rs.title, rs.step_order
       FROM portal.program_roadmaps pr
       JOIN portal.roadmaps r ON r.roadmap_id = pr.roadmap_id
       JOIN portal.roadmap_steps rs ON rs.roadmap_id = r.roadmap_id
       LEFT JOIN portal.user_roadmap_progress urp
         ON urp.step_id = rs.step_id AND urp.user_id = $1
       WHERE pr.program_id = $2 AND r.is_active = TRUE
         AND (urp.is_completed IS NULL OR urp.is_completed = FALSE)
       ORDER BY rs.step_order
       LIMIT 1`,
      [user_id, program_id],
    );

    // =====================================================
    // 3️⃣ RECOMMENDATIONS
    // =====================================================
    const recRes = await pool.query(
      `SELECT r.resource_id, r.title, r.url, rs.score
       FROM portal.resource_scores rs
       JOIN portal.resources r ON r.resource_id = rs.resource_id
       WHERE rs.user_id = $1 AND r.status = 'approved' AND r.deleted_at IS NULL
       ORDER BY rs.score DESC
       LIMIT 5`,
      [user_id],
    );

    // =====================================================
    // 4️⃣ DEGREE FEED – 60 / 30 / 10 rule
    //    60% from user's degree, 30% degree-agnostic, 10% cross-degree
    //    Only shown when user has an academic_degree_id
    // =====================================================
    let degreeFeed = [];

    if (academic_degree_id) {
      const baseFields = `
        d.discussion_id, d.title, d.content, d.created_at,
        d.like_count, d.comment_count, d.degree_id,
        u.full_name AS author_name, u.profile_image AS author_avatar
      `;

      const [sameDegree, noDegree, crossDegree] = await Promise.all([
        // 60% – same degree (fetch 6 for a 10-item feed)
        pool.query(
          `SELECT ${baseFields}, 'degree' AS feed_category
           FROM portal.discussions d
           JOIN portal.users u ON u.user_id = d.user_id
           WHERE d.deleted_at IS NULL AND d.is_deleted = FALSE AND u.status = 'active' AND d.degree_id = $1
           ORDER BY d.created_at DESC LIMIT 6`,
          [academic_degree_id],
        ),
        // 30% – no degree (general)
        pool.query(
          `SELECT ${baseFields}, 'general' AS feed_category
           FROM portal.discussions d
           JOIN portal.users u ON u.user_id = d.user_id
           WHERE d.deleted_at IS NULL AND d.is_deleted = FALSE AND u.status = 'active' AND d.degree_id IS NULL
           ORDER BY d.like_count DESC, d.created_at DESC LIMIT 3`,
        ),
        // 10% – cross-degree
        pool.query(
          `SELECT ${baseFields}, 'cross' AS feed_category
           FROM portal.discussions d
           JOIN portal.users u ON u.user_id = d.user_id
           WHERE d.deleted_at IS NULL AND d.is_deleted = FALSE AND u.status = 'active'
             AND d.degree_id IS NOT NULL AND d.degree_id != $1
           ORDER BY d.like_count DESC LIMIT 1`,
          [academic_degree_id],
        ),
      ]);

      degreeFeed = [
        ...sameDegree.rows,
        ...noDegree.rows,
        ...crossDegree.rows,
      ];
    }

    // =====================================================
    // 5️⃣ ACTIVE CLUBS
    // =====================================================
    const clubsRes = await pool.query(
      `SELECT c.club_id, c.name, COUNT(cm.user_id) AS members
       FROM portal.clubs c
       LEFT JOIN portal.club_members cm ON cm.club_id = c.club_id AND cm.status = 'approved'
       GROUP BY c.club_id
       ORDER BY members DESC
       LIMIT 5`,
    );

    // =====================================================
    // FINAL RESPONSE
    // =====================================================
    res.json({
      progress_percent: progress,
      next_step: nextStepRes.rows[0] || null,
      recommendations: recRes.rows,
      degree_feed: degreeFeed,
      active_clubs: clubsRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dashboard failed" });
  }
};
