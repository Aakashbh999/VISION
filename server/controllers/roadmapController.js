/**
 * Roadmap Controller
 * Manages learning roadmap enrollment, step progression, and resource tracking.
 * Implements completion tracking with proof-of-work (PoW) submissions and cooldown periods.
 *
 * Features:
 * - Roadmap browsing with enrollment status tracking
 * - Roadmap detail retrieval with step hierarchies and resources
 * - Step completion with 24-hour lockout between completions
 * - Proof-of-work (PoW) submission for step verification
 * - Resource visit tracking within roadmap context
 * - Step-specific resource retrieval
 * - User enrollment in roadmaps
 * - Roadmap abandonment tracking (leave status)
 */

const pool = require("../config/db");
const XPService = require("../services/xpService");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

exports.getAllRoadmaps = catchAsync(async (req, res) => {
  const { search } = req.query;
  const portalUserId = req.user.portal_user_id;

  let query = `
      SELECT
        r.roadmap_id, r.title, r.description, r.difficulty_level,
        (SELECT status  FROM portal.user_roadmap_enrolments ure WHERE ure.roadmap_id = r.roadmap_id AND ure.user_id = $1) as enrolment_status,
        (SELECT left_at FROM portal.user_roadmap_enrolments ure WHERE ure.roadmap_id = r.roadmap_id AND ure.user_id = $1) as left_at
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

exports.trackResourceVisit = catchAsync(async (req, res) => {
  const { stepId, resourceId } = req.params;
  const portalUserId = req.user.portal_user_id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const roadmapRes = await client.query(
      `SELECT roadmap_id FROM portal.roadmap_steps WHERE step_id = $1`,
      [stepId],
    );
    if (!roadmapRes.rows.length) {
      throw createError(404, "Step not found");
    }
    const roadmapId = roadmapRes.rows[0].roadmap_id;

    const enrolment = await client.query(
      `SELECT status, left_at FROM portal.user_roadmap_enrolments WHERE user_id = $1 AND roadmap_id = $2`,
      [portalUserId, roadmapId],
    );

    if (enrolment.rows.length) {
      const { status, left_at } = enrolment.rows[0];
      if (status === "left") {
        const SAME_ROADMAP_LOCKOUT_MS = 4 * 24 * 60 * 60 * 1000;
        if (
          left_at &&
          Date.now() - new Date(left_at).getTime() < SAME_ROADMAP_LOCKOUT_MS
        ) {
          throw createError(
            400,
            "You must wait before re-joining this roadmap.",
          );
        }
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
      throw createError(
        403,
        "You must lock this roadmap before you can track progress.",
      );
    }
    await client.query(
      `
      INSERT INTO portal.user_resource_interactions (user_id, resource_id, interaction_type)
      SELECT $1, $2, 'view'
      WHERE NOT EXISTS (
        SELECT 1 FROM portal.user_resource_interactions
        WHERE user_id = $1 AND resource_id = $2 AND interaction_type = 'view'
      )
      `,
      [portalUserId, resourceId],
    );

    await client.query(
      `
      INSERT INTO portal.user_roadmap_progress (user_id, step_id, first_viewed_at)
      SELECT $1, $2, NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM portal.user_roadmap_progress
        WHERE user_id = $1 AND step_id = $2
      )
      `,
      [portalUserId, stepId],
    );

    await client.query("COMMIT");
    res.json({ success: true, message: "Interaction tracked" });
  } catch (err) {
    console.error(`[trackResourceVisit] Error:`, err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

exports.getRoadmapDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const portalUserId = req.user.portal_user_id;

  const roadmap = await pool.query(
    `SELECT * FROM portal.roadmaps WHERE roadmap_id = $1 AND is_active = TRUE`,
    [id],
  );

  if (!roadmap.rows.length) {
    throw createError(404, "Roadmap not found");
  }

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

exports.getStepResources = catchAsync(async (req, res) => {
  const { stepId } = req.params;
  const portalUserId = req.user.portal_user_id;

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

exports.completeStep = catchAsync(async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { stepId } = req.params;
    const { submission_text, submission_link } = req.body;
    const portalUserId = req.user.portal_user_id;

    const stepMetadata = await client.query(
      `SELECT roadmap_id, step_order FROM portal.roadmap_steps WHERE step_id = $1`,
      [stepId],
    );
    if (!stepMetadata.rows.length) throw createError(404, "Step not found");
    const { roadmap_id: roadmapId, step_order: currentOrder } =
      stepMetadata.rows[0];

    const incompletePrevious = await client.query(
      `
      SELECT rs.title
      FROM portal.roadmap_steps rs
      LEFT JOIN portal.user_roadmap_progress urp ON urp.step_id = rs.step_id AND urp.user_id = $1
      WHERE rs.roadmap_id = $2
        AND rs.step_order < $3
        AND (urp.is_completed IS NULL OR urp.is_completed = FALSE)
      LIMIT 1
      `,
      [portalUserId, roadmapId, currentOrder],
    );

    if (incompletePrevious.rows.length) {
      throw createError(
        400,
        `You must complete previous steps first. Incomplete: "${incompletePrevious.rows[0].title}"`,
      );
    }

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

    const { total_required, visited_count, first_visit_time } =
      requirements.rows[0];

    if (parseInt(visited_count) < parseInt(total_required)) {
      throw createError(
        400,
        `You must open all ${total_required} resources before completion.`,
      );
    }

    if (!first_visit_time) {
      throw createError(400, "You haven't interacted with this step yet.");
    }

    const waitPeriod = 24 * 60 * 60 * 1000;
    const timePassed = Date.now() - new Date(first_visit_time).getTime();
    if (timePassed < waitPeriod) {
      const remainingMs = waitPeriod - timePassed;
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
      throw createError(
        400,
        `Step lockout active. Please spend more time learning. Available in ~${remainingHours} hours.`,
      );
    }

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

    const hasPoW = submission_text && submission_text.trim().length >= 100;
    const pointsEarned = hasPoW ? 20 : 10;

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

      await XPService.updateUserXP(
        portalUserId,
        pointsEarned,
        `Roadmap Step Completion (${hasPoW ? "Verified" : "Proof Submitted"})`,
        client,
      );

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

exports.getRoadmapPath = catchAsync(async (req, res) => {
  const { id } = req.params;
  const portalUserId = req.user.portal_user_id;

  const roadmap = await pool.query(
    `SELECT title, description, difficulty_level FROM portal.roadmaps WHERE roadmap_id = $1 AND is_active = TRUE`,
    [id],
  );

  if (!roadmap.rows.length) {
    throw createError(404, "Roadmap not found");
  }

  const result = await pool.query(
    `
      SELECT
        rs.step_id,
        rs.title,
        rs.description,
        rs.step_order,
        rs.estimated_time,
        rs.prerequisite_step_id,
        urp.first_viewed_at,
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
                ),
                'is_visited', EXISTS(
                  SELECT 1 FROM portal.user_resource_interactions
                  WHERE user_id = $1 AND resource_id = r.resource_id AND interaction_type = 'view'
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

  res.json({
    success: true,
    message:
      "You have left the roadmap. A 4-day cooldown applies before you can re-join this roadmap.",
  });
});

exports.getEnrolmentStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const portalUserId = req.user.portal_user_id;

  const result = await pool.query(
    `SELECT status, started_at, completed_at, left_at FROM portal.user_roadmap_enrolments WHERE user_id = $1 AND roadmap_id = $2`,
    [portalUserId, id],
  );

  res.json({ enrolment: result.rows[0] || null });
});

exports.lockRoadmap = catchAsync(async (req, res) => {
  const { id: roadmapId } = req.params;
  const portalUserId = req.user.portal_user_id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const roadmap = await client.query(
      `SELECT title FROM portal.roadmaps WHERE roadmap_id = $1 AND is_active = TRUE`,
      [roadmapId],
    );
    if (!roadmap.rows.length) {
      throw createError(404, "Roadmap not found");
    }

    const enrolment = await client.query(
      `SELECT status, left_at FROM portal.user_roadmap_enrolments WHERE user_id = $1 AND roadmap_id = $2`,
      [portalUserId, roadmapId],
    );

    if (enrolment.rows.length) {
      const { status, left_at } = enrolment.rows[0];
      if (status === "active")
        return res.json({ message: "Already locked and active." });
      if (status === "completed")
        throw createError(400, "You already completed this roadmap.");

      if (status === "left") {
        const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const leftTime = new Date(left_at).getTime();
        if (left_at && now - leftTime < FOUR_DAYS_MS) {
          throw createError(
            400,
            "You recently left this roadmap. Re-entry locked.",
          );
        }
        await client.query(
          `UPDATE portal.user_roadmap_enrolments SET status = 'active', last_activity_at = NOW() WHERE user_id = $1 AND roadmap_id = $2`,
          [portalUserId, roadmapId],
        );
      }
    } else {
      const activeOther = await client.query(
        `SELECT r.title FROM portal.user_roadmap_enrolments ure
         JOIN portal.roadmaps r ON r.roadmap_id = ure.roadmap_id
         WHERE ure.user_id = $1 AND ure.status = 'active'`,
        [portalUserId],
      );
      if (activeOther.rows.length) {
        throw createError(
          400,
          `Complete or leave "${activeOther.rows[0].title}" first.`,
        );
      }
      await client.query(
        `INSERT INTO portal.user_roadmap_enrolments (user_id, roadmap_id, status) VALUES ($1, $2, 'active')`,
        [portalUserId, roadmapId],
      );
    }

    await client.query("COMMIT");
    res.json({
      success: true,
      message: "Roadmap locked. You are now focused on this path.",
    });
  } catch (err) {
    console.error(`[lockRoadmap] Error:`, err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});
