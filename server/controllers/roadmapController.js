const pool = require("../config/db");
const XPService = require("../services/xpService");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

/* =====================================================
   GET ALL ROADMAPS
 ===================================================== */
exports.getAllRoadmaps = catchAsync(async (req, res) => {
  const { search } = req.query;
  const portalUserId = req.user.portal_user_id;

  let query = `
      SELECT 
        r.roadmap_id, r.title, r.description, r.difficulty_level,
        (SELECT status FROM portal.user_roadmap_enrolments ure WHERE ure.roadmap_id = r.roadmap_id AND ure.user_id = $1) as enrolment_status
      FROM portal.roadmaps r
      WHERE r.is_active = TRUE
    `;
  const params = [portalUserId];

  if (search) {
    query += ` AND (r.title % $2 OR r.description % $2 OR r.title ILIKE $3 OR r.description ILIKE $3)`;
    params.push(search, `%${search}%`);
  }

  query += ` ORDER BY ${search ? `similarity(r.title, $2) DESC` : "r.roadmap_id"}`;

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

/* ===============================
   TRACK Resource Interaction
================================ */
exports.trackResourceVisit = catchAsync(async (req, res) => {
  const { stepId, resourceId } = req.params;
  const portalUserId = req.user.portal_user_id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 0. Ensure Enrolment & Anti-Spam Check
    const roadmapRes = await client.query(
      `SELECT roadmap_id FROM portal.roadmap_steps WHERE step_id = $1`,
      [stepId],
    );
    if (!roadmapRes.rows.length) throw createError(404, "Step not found");
    const roadmapId = roadmapRes.rows[0].roadmap_id;

    const enrolment = await client.query(
      `SELECT status, left_at FROM portal.user_roadmap_enrolments WHERE user_id = $1 AND roadmap_id = $2`,
      [portalUserId, roadmapId],
    );

    if (enrolment.rows.length) {
      const { status } = enrolment.rows[0];
      if (status === "left") {
        // Re-activating the same roadmap is allowed immediately
        await client.query(
          `UPDATE portal.user_roadmap_enrolments SET status = 'active', last_activity_at = NOW() WHERE user_id = $1 AND roadmap_id = $2`,
          [portalUserId, roadmapId],
        );
      } else if (status === "active") {
        await client.query(
          `UPDATE portal.user_roadmap_enrolments SET last_activity_at = NOW() WHERE user_id = $1 AND roadmap_id = $2`,
          [portalUserId, roadmapId],
        );
      }
    } else {
      // NEW ENROLMENT: Check constraints
      // Check for other active roadmap
      const activeOther = await client.query(
        `
        SELECT r.title 
        FROM portal.user_roadmap_enrolments ure
        JOIN portal.roadmaps r ON r.roadmap_id = ure.roadmap_id
        WHERE ure.user_id = $1 AND ure.status = 'active'
        `,
        [portalUserId],
      );

      if (activeOther.rows.length) {
        throw createError(
          400,
          `You already have an active roadmap: "${activeOther.rows[0].title}". You must finish or leave it before starting a new one.`,
        );
      }

      // Check for 24h lockout after leaving ANY roadmap
      const recentLeft = await client.query(
        `
        SELECT left_at 
        FROM portal.user_roadmap_enrolments 
        WHERE user_id = $1 AND status = 'left' AND left_at > NOW() - INTERVAL '24 hours'
        ORDER BY left_at DESC LIMIT 1
        `,
        [portalUserId],
      );

      if (recentLeft.rows.length) {
        const leftAt = new Date(recentLeft.rows[0].left_at);
        const unlocksAt = new Date(leftAt.getTime() + 24 * 60 * 60 * 1000);
        const hoursLeft = Math.ceil((unlocksAt - Date.now()) / (1000 * 60 * 60));

        throw createError(
          400,
          `Lockout Active: You recently left another roadmap. Please wait ~${hoursLeft} hours before starting a new one.`,
        );
      }

      // Create new enrolment
      await client.query(
        `INSERT INTO portal.user_roadmap_enrolments (user_id, roadmap_id, status) VALUES ($1, $2, 'active')`,
        [portalUserId, roadmapId],
      );
    }

    // 1. Record the interaction
    await client.query(
      `
      INSERT INTO portal.user_resource_interactions (user_id, resource_id, interaction_type)
      VALUES ($1, $2, 'view')
      ON CONFLICT (user_id, resource_id, interaction_type) DO NOTHING
      `,
      [portalUserId, resourceId],
    );

    // 2. Initialize first_viewed_at for the step if not already set
    await client.query(
      `
      INSERT INTO portal.user_roadmap_progress (user_id, step_id, first_viewed_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, step_id) 
      DO UPDATE SET first_viewed_at = COALESCE(portal.user_roadmap_progress.first_viewed_at, EXCLUDED.first_viewed_at)
      `,
      [portalUserId, stepId],
    );

    await client.query("COMMIT");
    res.json({ success: true, message: "Interaction tracked" });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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
        COALESCE(urp.is_completed, FALSE) AS is_completed,
        urp.first_viewed_at
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
        COALESCE(AVG(rs.score), 0) AS avg_score,
        EXISTS(
          SELECT 1 FROM portal.user_resource_interactions uri 
          WHERE uri.resource_id = r.resource_id 
          AND uri.user_id = $2 
          AND uri.interaction_type = 'view'
        ) AS is_visited
      FROM portal.step_resource_map srm
      JOIN portal.resources r ON r.resource_id = srm.resource_id
      LEFT JOIN portal.resource_scores rs ON rs.resource_id = r.resource_id
      WHERE srm.step_id = $1
      GROUP BY r.resource_id, srm.is_required
      ORDER BY avg_score DESC, r.resource_id ASC
    `,
    [stepId, portalUserId],
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
    const { submission_text, submission_link } = req.body;
    const portalUserId = req.user.portal_user_id;

    // 1. Verify requirements (All required resources visited + 24h lockout)
    const requirements = await client.query(
      `
      WITH step_resources AS (
        SELECT resource_id FROM portal.step_resource_map WHERE step_id = $1
      ),
      user_visits AS (
        SELECT resource_id FROM portal.user_resource_interactions 
        WHERE user_id = $2 AND interaction_type = 'view'
        AND resource_id IN (SELECT resource_id FROM step_resources)
      ),
      first_visit AS (
        SELECT first_viewed_at FROM portal.user_roadmap_progress
        WHERE user_id = $2 AND step_id = $1
      )
      SELECT 
        (SELECT COUNT(*) FROM step_resources) as total_required,
        (SELECT COUNT(*) FROM user_visits) as visited_count,
        (SELECT first_viewed_at FROM first_visit) as first_visit_time
      `,
      [stepId, portalUserId],
    );

    const { total_required, visited_count, first_visit_time } = requirements.rows[0];

    // Check resources
    if (parseInt(visited_count) < parseInt(total_required)) {
      throw createError(400, `You must open all ${total_required} resources before completion.`);
    }

    // Check 24h lockout
    if (!first_visit_time) {
      throw createError(400, "You haven't interacted with this step yet.");
    }

    const waitPeriod = 24 * 60 * 60 * 1000; // 24 hours
    const timePassed = Date.now() - new Date(first_visit_time).getTime();
    if (timePassed < waitPeriod) {
      const remainingMs = waitPeriod - timePassed;
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
      throw createError(400, `Step lockout active. Please spend more time learning. Available in ~${remainingHours} hours.`);
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

    // VXP Calculation: Standard 10, 20 if Proof of Work provided.
    // Enhanced PoW check: 100 characters minimum
    const hasPoW = submission_text && submission_text.trim().length >= 100;
    const pointsEarned = hasPoW ? 20 : 10;

    // UPSERT progress (Simplified: No verification status/keywords)
    await client.query(
      `
        INSERT INTO portal.user_roadmap_progress
          (user_id, step_id, is_completed, completed_at, submission_text, submission_link, points_earned)
        VALUES ($1, $2, TRUE, NOW(), $3, $4, $5)
        ON CONFLICT (user_id, step_id)
        DO UPDATE SET
          is_completed = TRUE,
          completed_at = NOW(),
          submission_text = EXCLUDED.submission_text,
          submission_link = EXCLUDED.submission_link,
          points_earned = EXCLUDED.points_earned
      `,
      [portalUserId, stepId, submission_text, submission_link, pointsEarned],
    );

    // Only create events on FIRST completion
    if (!alreadyCompleted) {
      await client.query(
        `
          INSERT INTO portal.notifications
            (user_id, type, title, message, related_type, related_id)
          VALUES
            ($1, 'roadmap_completed', 'Roadmap Progress', 'You completed a roadmap step', 'roadmap_step', $2)
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
        pointsEarned,
        `Roadmap Step Completion (${hasPoW ? "Verified" : "Proof Submitted"})`,
        client,
      );

      // Check for overall roadmap completion
      const roadmapQuery = await client.query(
        `SELECT roadmap_id FROM portal.roadmap_steps WHERE step_id = $1`,
        [stepId],
      );
      const roadmapId = roadmapQuery.rows[0].roadmap_id;

      const finishCheck = await client.query(
        `
        SELECT 
          (SELECT COUNT(*) FROM portal.roadmap_steps WHERE roadmap_id = $1) as total_steps,
          (SELECT COUNT(*) FROM portal.user_roadmap_progress urp 
           JOIN portal.roadmap_steps rs ON rs.step_id = urp.step_id 
           WHERE rs.roadmap_id = $1 AND urp.user_id = $2 AND urp.is_completed = TRUE) as completed_steps
        `,
        [roadmapId, portalUserId],
      );

      const { total_steps, completed_steps } = finishCheck.rows[0];

      if (parseInt(completed_steps) >= parseInt(total_steps)) {
        await client.query(
          `UPDATE portal.user_roadmap_enrolments SET status = 'completed', completed_at = NOW() WHERE user_id = $1 AND roadmap_id = $2`,
          [portalUserId, roadmapId],
        );
      }
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
        COALESCE(urp.is_verified, FALSE) AS is_verified,
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

/* =====================================================
   LEAVE ROADMAP
 ===================================================== */
exports.leaveRoadmap = catchAsync(async (req, res) => {
  const { id } = req.params;
  const portalUserId = req.user.portal_user_id;

  const result = await pool.query(
    `
    UPDATE portal.user_roadmap_enrolments 
    SET status = 'left', left_at = NOW() 
    WHERE user_id = $1 AND roadmap_id = $2 AND status = 'active'
    RETURNING *
    `,
    [portalUserId, id],
  );

  if (!result.rows.length) {
    throw createError(400, "No active enrolment found for this roadmap.");
  }

  res.json({ success: true, message: "You have left the roadmap. A 24h lockout applies for starting new roadmaps." });
});

/* =====================================================
   GET ROADMAP ENROLMENT STATUS
 ===================================================== */
exports.getEnrolmentStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const portalUserId = req.user.portal_user_id;

  const result = await pool.query(
    `SELECT status, started_at, completed_at, left_at FROM portal.user_roadmap_enrolments WHERE user_id = $1 AND roadmap_id = $2`,
    [portalUserId, id],
  );

  res.json({ enrolment: result.rows[0] || null });
});
