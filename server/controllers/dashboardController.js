const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");

exports.getDashboard = catchAsync(async (req, res) => {
  const { portal_user_id: user_id, program_id, academic_degree_id } = req.user;

  const baseFields = `
    d.discussion_id, d.title, d.content, d.created_at,
    d.like_count, d.comment_count, d.degree_id,
    u.full_name AS author_name, u.profile_image AS author_avatar
  `;

  // Run all independent queries in parallel (single round-trip)
  const [
    progressRes,
    nextStepRes,
    recRes,
    clubsRes,
    degreeFeedResults,
    vxpActivityRes,
    discussionCountRes,
  ] = await Promise.all([
    // 1️⃣ ROADMAP PROGRESS (Aggregate average across all active roadmaps)
    pool.query(
      `SELECT
          COALESCE(AVG(roadmap_percent), 0) AS percent
       FROM (
         SELECT
           r.roadmap_id,
           COALESCE(
             COUNT(urp.step_id) FILTER (WHERE urp.is_completed = TRUE) * 100.0 /
             NULLIF(COUNT(rs.step_id), 0), 0
           ) AS roadmap_percent
         FROM portal.roadmaps r
         JOIN portal.roadmap_steps rs ON rs.roadmap_id = r.roadmap_id
         LEFT JOIN portal.user_roadmap_progress urp
           ON urp.step_id = rs.step_id AND urp.user_id = $1
         WHERE r.is_active = TRUE
         GROUP BY r.roadmap_id
       ) AS roadmap_progresses`,
      [user_id],
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

    // 3️⃣ PERSONALISED RECOMMENDATIONS
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

    // 5️⃣ DEGREE FEED (60/30/10 split)
    academic_degree_id
      ? Promise.all([
          pool.query(
            `SELECT ${baseFields}, 'degree' AS feed_category
             FROM portal.discussions d
             JOIN portal.users u ON u.user_id = d.user_id
             WHERE d.deleted_at IS NULL AND d.is_deleted = FALSE
               AND u.is_suspended = FALSE AND d.degree_id = $1
             ORDER BY d.created_at DESC LIMIT 6`,
            [academic_degree_id],
          ),
          pool.query(
            `SELECT ${baseFields}, 'general' AS feed_category
             FROM portal.discussions d
             JOIN portal.users u ON u.user_id = d.user_id
             WHERE d.deleted_at IS NULL AND d.is_deleted = FALSE
               AND u.is_suspended = FALSE AND d.degree_id IS NULL
             ORDER BY d.like_count DESC, d.created_at DESC LIMIT 3`,
          ),
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

    // 6️⃣ VXP ACTIVITY — last 7 days grouped by day
    pool.query(
      `SELECT
         TO_CHAR(DATE(created_at), 'Dy') AS day,
         DATE(created_at) AS date,
         COALESCE(SUM(amount) FILTER (WHERE amount > 0), 0)::int AS xp_gained
       FROM portal.xp_activity_log
       WHERE user_id = $1
         AND created_at >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [user_id],
    ),

    // 7️⃣ DISCUSSION COUNT
    pool.query(
      `SELECT COUNT(*)::int AS count
       FROM portal.discussions
       WHERE user_id = $1
         AND is_deleted = FALSE
         AND deleted_at IS NULL`,
      [user_id],
    ),
  ]);

  // Merge degree feed slices
  let degreeFeed = [];
  if (degreeFeedResults) {
    const [sameDegree, noDegree, crossDegree] = degreeFeedResults;
    degreeFeed = [...sameDegree.rows, ...noDegree.rows, ...crossDegree.rows];
  }

  // Build 7-day VXP activity array (fill zeros for missing days)
  const activityMap = {};
  vxpActivityRes.rows.forEach((r) => {
    activityMap[r.date.toISOString().split("T")[0]] = {
      day: r.day,
      xp_gained: r.xp_gained,
    };
  });

  const vxpActivity = [];
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    vxpActivity.push({
      day: activityMap[key]?.day || DAY_LABELS[d.getDay()],
      xp_gained: activityMap[key]?.xp_gained || 0,
    });
  }

  return res.json({
    progress_percent: Math.round(parseFloat(progressRes.rows[0].percent || 0)),
    next_step: nextStepRes.rows[0] || null,
    recommendations: recRes.rows,
    degree_feed: degreeFeed,
    active_clubs: clubsRes.rows,
    vxp_activity: vxpActivity,
    discussion_count: discussionCountRes.rows[0]?.count ?? 0,
  });
});
