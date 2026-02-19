const pool = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    const authUserId = req.user.auth_user_id;

    // Get portal user
    const userRes = await pool.query(
      `SELECT user_id, program_id
       FROM portal.users
       WHERE auth_user_id = $1`,
      [authUserId],
    );

    if (userRes.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const { user_id, program_id } = userRes.rows[0];

    // =====================================================
    // 1️⃣ ROADMAP PROGRESS (via program_roadmaps)
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
       WHERE pr.program_id = $2`,
      [user_id, program_id],
    );

    const progress = parseFloat(progressRes.rows[0].percent).toFixed(2);

    // =====================================================
    // 2️⃣ NEXT STEP
    // =====================================================
    const nextStep = await pool.query(
      `SELECT rs.step_id, rs.title, rs.step_order
       FROM portal.program_roadmaps pr
       JOIN portal.roadmaps r ON r.roadmap_id = pr.roadmap_id
       JOIN portal.roadmap_steps rs ON rs.roadmap_id = r.roadmap_id
       LEFT JOIN portal.user_roadmap_progress urp
         ON urp.step_id = rs.step_id AND urp.user_id = $1
       WHERE pr.program_id = $2
         AND (urp.is_completed IS NULL OR urp.is_completed = FALSE)
       ORDER BY rs.step_order
       LIMIT 1`,
      [user_id, program_id],
    );

    // =====================================================
    // 3️⃣ RECOMMENDATIONS
    // =====================================================
    const rec = await pool.query(
      `SELECT r.resource_id, r.title, r.url, rs.score
       FROM portal.resource_scores rs
       JOIN portal.resources r ON r.resource_id = rs.resource_id
       WHERE rs.user_id = $1
       ORDER BY rs.score DESC
       LIMIT 5`,
      [user_id],
    );

    // =====================================================
    // 4️⃣ TRENDING DISCUSSIONS
    // =====================================================
    const discussions = await pool.query(
      `SELECT d.discussion_id, d.title,
          COUNT(dl.user_id) AS likes
   FROM portal.discussions d
   LEFT JOIN portal.discussion_likes dl
     ON dl.discussion_id = d.discussion_id
   GROUP BY d.discussion_id
   ORDER BY likes DESC, d.created_at DESC
   LIMIT 5`,
    );

    // =====================================================
    // 5️⃣ ACTIVE CLUBS
    // =====================================================
    const clubs = await pool.query(
      `SELECT c.club_id, c.name, COUNT(cm.user_id) AS members
       FROM portal.clubs c
       LEFT JOIN portal.club_members cm ON cm.club_id = c.club_id
       GROUP BY c.club_id
       ORDER BY members DESC
       LIMIT 5`,
    );

    // =====================================================
    // FINAL RESPONSE
    // =====================================================
    res.json({
      progress_percent: progress,
      next_step: nextStep.rows[0] || null,
      recommendations: rec.rows,
      trending_discussions: discussions.rows,
      active_clubs: clubs.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dashboard failed" });
  }
};
