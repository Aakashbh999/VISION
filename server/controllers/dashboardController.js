const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");

exports.getDashboard = catchAsync(async (req, res) => {
  // All user fields are already on req.user from authMiddleware — no extra DB lookup needed
  const { portal_user_id: user_id, program_id, academic_degree_id } = req.user;

  const baseFields = `
    d.discussion_id, d.title, d.content, d.created_at,
    d.like_count, d.comment_count, d.degree_id,
    u.full_name AS author_name, u.profile_image AS author_avatar
  `;

  // Run all independent queries in parallel (single round-trip instead of 5 sequential)
  const [progressRes, nextStepRes, recRes, clubsRes, degreeFeedResults] =
    await Promise.all([
      // 1️⃣ ROADMAP PROGRESS
      pool.query(
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
      ),

      // 2️⃣ NEXT INCOMPLETE STEP
      pool.query(
        `SELECT rs.step_id, rs.title, rs.step_order, r.roadmap_id
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
      ),

      // 3️⃣ PERSONALISED RECOMMENDATIONS (from scored resources)
      pool.query(
        `SELECT r.resource_id, r.title, r.url, rs.score
         FROM portal.resource_scores rs
         JOIN portal.resources r ON r.resource_id = rs.resource_id
         WHERE rs.user_id = $1 AND r.status = 'approved' AND r.deleted_at IS NULL
         ORDER BY rs.score DESC
         LIMIT 5`,
        [user_id],
      ),

      // 4️⃣ ACTIVE CLUBS
      pool.query(
        `SELECT c.club_id, c.name, COUNT(cm.user_id) AS members
         FROM portal.clubs c
         LEFT JOIN portal.club_members cm ON cm.club_id = c.club_id AND cm.status = 'approved'
         GROUP BY c.club_id
         ORDER BY members DESC
         LIMIT 5`,
      ),

      // 5️⃣ DEGREE FEED (60/30/10 split) — only for users with a degree_id
      academic_degree_id
        ? Promise.all([
            // 60% — same degree
            pool.query(
              `SELECT ${baseFields}, 'degree' AS feed_category
               FROM portal.discussions d
               JOIN portal.users u ON u.user_id = d.user_id
               WHERE d.deleted_at IS NULL AND d.is_deleted = FALSE
                 AND u.is_suspended = FALSE AND d.degree_id = $1
               ORDER BY d.created_at DESC LIMIT 6`,
              [academic_degree_id],
            ),
            // 30% — degree-agnostic / general
            pool.query(
              `SELECT ${baseFields}, 'general' AS feed_category
               FROM portal.discussions d
               JOIN portal.users u ON u.user_id = d.user_id
               WHERE d.deleted_at IS NULL AND d.is_deleted = FALSE
                 AND u.is_suspended = FALSE AND d.degree_id IS NULL
               ORDER BY d.like_count DESC, d.created_at DESC LIMIT 3`,
            ),
            // 10% — cross-degree discovery
            pool.query(
              `SELECT ${baseFields}, 'cross' AS feed_category
               FROM portal.discussions d
               JOIN portal.users u ON u.user_id = d.user_id
               WHERE d.deleted_at IS NULL AND d.is_deleted = FALSE
                 AND u.is_suspended = FALSE
                 AND d.degree_id IS NOT NULL AND d.degree_id != $1
               ORDER BY d.like_count DESC LIMIT 1`,
              [academic_degree_id],
            ),
          ])
        : Promise.resolve(null),
    ]);

  let degreeFeed = [];
  if (degreeFeedResults) {
    const [sameDegree, noDegree, crossDegree] = degreeFeedResults;
    degreeFeed = [...sameDegree.rows, ...noDegree.rows, ...crossDegree.rows];
  }

  return res.json({
    progress_percent: parseFloat(progressRes.rows[0].percent).toFixed(2),
    next_step: nextStepRes.rows[0] || null,
    recommendations: recRes.rows,
    degree_feed: degreeFeed,
    active_clubs: clubsRes.rows,
  });
});
