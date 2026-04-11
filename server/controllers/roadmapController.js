const pool = require("../config/db");
const XPService = require("../services/xpService");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

/* =====================================================
   GET ALL ROADMAPS
 ===================================================== */
exports.getAllRoadmaps = catchAsync(async (req, res) => {
  const { search } = req.query;
  let query = `
      SELECT roadmap_id, title, description, difficulty_level
      FROM portal.roadmaps
      WHERE is_active = TRUE
    `;
  const params = [];

  if (search) {
    query += ` AND (title % $1 OR description % $1 OR title ILIKE $2 OR description ILIKE $2)`;
    params.push(search, `%${search}%`);
  }

  query += ` ORDER BY ${search ? `similarity(title, $1) DESC` : "roadmap_id"}`;

  const result = await pool.query(query, params);

  // If searching and no results found, fetch recommendations
  if (search && result.rows.length === 0) {
    const {
      userSemester,
      userProgramId,
      userDegreeId,
      portal_user_id: userId,
    } = req.user;
    const recommendationService = require("../services/recommendationService");
    const recommendations = await recommendationService.getRecommendations(
      userId,
      userSemester,
      userProgramId,
      userDegreeId,
      6,
    );
    return res.json({
      roadmaps: [],
      recommendations,
      noResults: true,
    });
  }

  res.json(result.rows);
});

/* =====================================================
   GET ROADMAP DETAILS + STEP STATUS
 ===================================================== */
exports.getRoadmapDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const portalUserId = req.user.portal_user_id;

  // roadmap exists?
  const roadmap = await pool.query(
    `SELECT * FROM portal.roadmaps WHERE roadmap_id = $1 AND is_active = TRUE`,
    [id],
  );

  if (!roadmap.rows.length) {
    throw createError(404, "Roadmap not found");
  }

  // steps + completion
  const steps = await pool.query(
    `
      SELECT 
        rs.step_id,
        rs.title,
        rs.description,
        rs.step_order,
        rs.estimated_time,
        COALESCE(urp.is_completed, FALSE) AS is_completed
      FROM portal.roadmap_steps rs
      LEFT JOIN portal.user_roadmap_progress urp
        ON urp.step_id = rs.step_id AND urp.user_id = $1
      WHERE rs.roadmap_id = $2
      ORDER BY rs.step_order
    `,
    [portalUserId, id],
  );

  // progress %
  const progress = await pool.query(
    `
      SELECT COALESCE(
        ROUND(
          COUNT(*) FILTER (WHERE urp.is_completed = TRUE) * 100.0 /
          NULLIF(COUNT(rs.step_id), 0), 2
        ), 0
      ) AS progress_percent
      FROM portal.roadmap_steps rs
      LEFT JOIN portal.user_roadmap_progress urp
        ON urp.step_id = rs.step_id AND urp.user_id = $1
      WHERE rs.roadmap_id = $2
    `,
    [portalUserId, id],
  );

  res.json({
    roadmap: roadmap.rows[0],
    progress_percent: progress.rows[0].progress_percent,
    steps: steps.rows,
  });
});

/* =====================================================
   GET STEP RESOURCES
 ===================================================== */
exports.getStepResources = catchAsync(async (req, res) => {
  const { stepId } = req.params;

  const resources = await pool.query(
    `
      SELECT 
        r.resource_id, 
        r.title, 
        r.description,
        r.url, 
        r.resource_type,
        r.difficulty_level,
        srm.is_required,
        COALESCE(AVG(rs.score), 0) AS avg_score
      FROM portal.step_resource_map srm
      JOIN portal.resources r ON r.resource_id = srm.resource_id
      LEFT JOIN portal.resource_scores rs ON rs.resource_id = r.resource_id
      WHERE srm.step_id = $1
      GROUP BY r.resource_id, srm.is_required
      ORDER BY avg_score DESC, r.resource_id ASC
    `,
    [stepId],
  );

  res.json(resources.rows);
});

/* =====================================================
   COMPLETE STEP (SAFE + TRANSACTIONAL)
 ===================================================== */
exports.completeStep = catchAsync(async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { stepId } = req.params;
    const portalUserId = req.user.portal_user_id;

    // Validate step exists
    const stepCheck = await client.query(
      `SELECT step_id FROM portal.roadmap_steps WHERE step_id = $1`,
      [stepId],
    );

    if (!stepCheck.rows.length) {
      throw createError(404, "Step not found");
    }

    // Check previous completion
    const existing = await client.query(
      `
        SELECT is_completed
        FROM portal.user_roadmap_progress
        WHERE user_id = $1 AND step_id = $2
      `,
      [portalUserId, stepId],
    );

    const alreadyCompleted =
      existing.rows.length && existing.rows[0].is_completed;

    // UPSERT progress
    await client.query(
      `
        INSERT INTO portal.user_roadmap_progress
          (user_id, step_id, is_completed, completed_at)
        VALUES ($1, $2, TRUE, NOW())
        ON CONFLICT (user_id, step_id)
        DO UPDATE SET
          is_completed = TRUE,
          completed_at = NOW()
      `,
      [portalUserId, stepId],
    );

    // Only create events on FIRST completion
    if (!alreadyCompleted) {
      await client.query(
        `
          INSERT INTO portal.notifications
            (user_id, message, related_type, related_id)
          VALUES
            ($1, 'You completed a roadmap step \ud83c\udf89', 'roadmap_step', $2)
        `,
        [portalUserId, stepId],
      );

      await client.query(
        `
          INSERT INTO portal.activity_feed
            (actor_user_id, action_type, reference_type, reference_id)
          VALUES
            ($1, 'completed_step', 'roadmap_step', $2)
        `,
        [portalUserId, stepId],
      );

      // Grant XP
      await XPService.updateUserXP(
        portalUserId,
        50,
        "Roadmap Step Completion",
        client,
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Step marked as completed" });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

/* =====================================================
   GET ROADMAP PROGRESS ONLY
 ===================================================== */
exports.getRoadmapProgress = catchAsync(async (req, res) => {
  const roadmapId = req.params.id;
  const portalUserId = req.user.portal_user_id;

  const progressRes = await pool.query(
    `
      SELECT COALESCE(
        ROUND(
          COUNT(*) FILTER (WHERE urp.is_completed = TRUE) * 100.0 /
          NULLIF(COUNT(rs.step_id), 0), 2
        ), 0
      ) AS progress_percent
      FROM portal.roadmap_steps rs
      LEFT JOIN portal.user_roadmap_progress urp
        ON urp.step_id = rs.step_id AND urp.user_id = $1
      WHERE rs.roadmap_id = $2
    `,
    [portalUserId, roadmapId],
  );

  res.json({
    roadmap_id: roadmapId,
    progress_percent: progressRes.rows[0].progress_percent,
  });
});

/* =====================================================
   GET ROADMAP PATH (Subway Map Data)
   Returns steps with nested approved resources and scores
 ===================================================== */
exports.getRoadmapPath = catchAsync(async (req, res) => {
  const { id } = req.params;
  const portalUserId = req.user.portal_user_id;

  // Fetch roadmap metadata first
  const roadmap = await pool.query(
    `SELECT title, description, difficulty_level FROM portal.roadmaps WHERE roadmap_id = $1 AND is_active = TRUE`,
    [id],
  );

  if (!roadmap.rows.length) {
    throw createError(404, "Roadmap not found");
  }

  // Single query for steps + materials + avg_score
  const result = await pool.query(
    `
      SELECT 
        rs.step_id, 
        rs.title, 
        rs.description, 
        rs.step_order,
        rs.estimated_time,
        rs.prerequisite_step_id,
        COALESCE(urp.is_completed, FALSE) AS is_completed,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'resource_id', r.resource_id,
                'title', r.title,
                'url', r.url,
                'resource_type', r.resource_type,
                'is_required', srm.is_required,
                'avg_score', (
                  SELECT COALESCE(ROUND(AVG(score)::numeric, 1), 0.0) 
                  FROM portal.resource_scores 
                  WHERE resource_id = r.resource_id
                )
              )
            )
            FROM portal.step_resource_map srm
            JOIN portal.resources r ON r.resource_id = srm.resource_id
            WHERE srm.step_id = rs.step_id AND r.status = 'approved' AND r.deleted_at IS NULL
          ),
          '[]'
        ) as resources
      FROM portal.roadmap_steps rs
      LEFT JOIN portal.user_roadmap_progress urp
        ON urp.step_id = rs.step_id AND urp.user_id = $1
      WHERE rs.roadmap_id = $2
      ORDER BY rs.step_order ASC
      `,
    [portalUserId, id],
  );

  res.json({
    roadmap: roadmap.rows[0],
    steps: result.rows,
  });
});
