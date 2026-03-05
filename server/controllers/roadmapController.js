const pool = require("../config/db");

/* =====================================================
   GET ALL ROADMAPS
===================================================== */
exports.getAllRoadmaps = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT roadmap_id, title, description, difficulty_level
      FROM portal.roadmaps
      WHERE is_active = TRUE
      ORDER BY roadmap_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roadmaps" });
  }
};

/* =====================================================
   GET ROADMAP DETAILS + STEP STATUS
===================================================== */
exports.getRoadmapDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const portalUserId = req.user.portal_user_id;

    // roadmap exists?
    const roadmap = await pool.query(
      `SELECT * FROM portal.roadmaps WHERE roadmap_id = $1`,
      [id],
    );

    if (!roadmap.rows.length)
      return res.status(404).json({ error: "Roadmap not found" });

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roadmap details" });
  }
};

/* =====================================================
   GET STEP RESOURCES
===================================================== */
exports.getStepResources = async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch step resources" });
  }
};

/* =====================================================
   COMPLETE STEP (SAFE + TRANSACTIONAL)
===================================================== */
exports.completeStep = async (req, res) => {
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
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Step not found" });
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
          ($1, 'You completed a roadmap step 🎉', 'roadmap_step', $2)
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
    }

    await client.query("COMMIT");
    res.json({ message: "Step marked as completed" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to update progress" });
  } finally {
    client.release();
  }
};

/* =====================================================
   GET ROADMAP PROGRESS ONLY
===================================================== */
exports.getRoadmapProgress = async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to calculate progress" });
  }
};
