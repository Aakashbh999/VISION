const pool = require("../config/db");
const XPService = require("../services/xpService");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

// Helper to generate a slug
const generateSlug = (title) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// ROADMAPS CRUD

exports.getAllAdminRoadmaps = catchAsync(async (req, res) => {
  const result = await pool.query(`
    SELECT r.*, 
      (SELECT COUNT(*) FROM portal.roadmap_steps s WHERE s.roadmap_id = r.roadmap_id AND s.deleted_at IS NULL) as step_count
    FROM portal.roadmaps r
    WHERE r.deleted_at IS NULL
    ORDER BY r.created_at DESC
  `);
  res.json(result.rows);
});

exports.getAdminRoadmapById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Get roadmap
  const roadmapRes = await pool.query(`
    SELECT * FROM portal.roadmaps WHERE roadmap_id = $1 AND deleted_at IS NULL
  `, [id]);
  
  if (roadmapRes.rows.length === 0) {
    throw createError(404, "Roadmap not found");
  }
  
  // Get steps
  const stepsRes = await pool.query(`
    SELECT * FROM portal.roadmap_steps 
    WHERE roadmap_id = $1 AND deleted_at IS NULL
    ORDER BY step_order ASC
  `, [id]);
  
  const roadmap = roadmapRes.rows[0];
  roadmap.steps = stepsRes.rows;
  
  // Get resources for each step
  for (const step of roadmap.steps) {
    const resourcesRes = await pool.query(`
      SELECT r.*, sm.is_required 
      FROM portal.step_resource_map sm
      JOIN portal.resources r ON sm.resource_id = r.resource_id
      WHERE sm.step_id = $1
    `, [step.step_id]);
    step.resources = resourcesRes.rows;
  }
  
  res.json(roadmap);
});

exports.createRoadmap = catchAsync(async (req, res) => {
  const { title, description, difficulty_level, estimated_duration, is_active } = req.body;
  let slug = generateSlug(title);
  
  // Ensure slug is unique
  const existing = await pool.query(`SELECT 1 FROM portal.roadmaps WHERE slug = $1`, [slug]);
  if (existing.rows.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  const insertResult = await pool.query(`
    INSERT INTO portal.roadmaps (title, slug, description, difficulty_level, estimated_duration, is_active)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [title, slug, description, difficulty_level, estimated_duration, is_active ?? true]);

  res.status(201).json(insertResult.rows[0]);
});

exports.updateRoadmap = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, difficulty_level, estimated_duration, is_active } = req.body;
  let slug = generateSlug(title);
  
  // Ensure slug is unique, excluding this ID
  const existing = await pool.query(`SELECT 1 FROM portal.roadmaps WHERE slug = $1 AND roadmap_id != $2`, [slug, id]);
  if (existing.rows.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  const updateResult = await pool.query(`
    UPDATE portal.roadmaps 
    SET title = $1, slug = $2, description = $3, difficulty_level = $4, estimated_duration = $5, is_active = $6
    WHERE roadmap_id = $7 AND deleted_at IS NULL
    RETURNING *
  `, [title, slug, description, difficulty_level, estimated_duration, is_active, id]);

  if (updateResult.rows.length === 0) {
    throw createError(404, "Roadmap not found");
  }

  res.json(updateResult.rows[0]);
});

exports.softDeleteRoadmap = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(`
    UPDATE portal.roadmaps SET deleted_at = CURRENT_TIMESTAMP WHERE roadmap_id = $1
    RETURNING *
  `, [id]);
  
  if (result.rows.length === 0) {
    throw createError(404, "Roadmap not found");
  }
  
  res.json({ message: "Roadmap deleted successfully" });
});

// ROADMAP STEPS CRUD

exports.addStep = catchAsync(async (req, res) => {
  const { roadmapId } = req.params;
  const { title, description, estimated_time } = req.body;
  
  // Get next step_order
  const nextOrderRes = await pool.query(`
    SELECT COALESCE(MAX(step_order), 0) + 1 as next_order
    FROM portal.roadmap_steps 
    WHERE roadmap_id = $1
  `, [roadmapId]);
  const nextOrder = nextOrderRes.rows[0].next_order;

  const insertResult = await pool.query(`
    INSERT INTO portal.roadmap_steps (roadmap_id, title, description, step_order, estimated_time)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [roadmapId, title, description, nextOrder, estimated_time]);

  res.status(201).json(insertResult.rows[0]);
});

exports.updateStep = catchAsync(async (req, res) => {
  const { stepId } = req.params;
  const { title, description, estimated_time } = req.body;

  const updateResult = await pool.query(`
    UPDATE portal.roadmap_steps 
    SET title = $1, description = $2, estimated_time = $3
    WHERE step_id = $4 AND deleted_at IS NULL
    RETURNING *
  `, [title, description, estimated_time, stepId]);

  if (updateResult.rows.length === 0) {
    throw createError(404, "Step not found");
  }

  res.json(updateResult.rows[0]);
});

exports.softDeleteStep = catchAsync(async (req, res) => {
  const { stepId } = req.params;
  const result = await pool.query(`
    UPDATE portal.roadmap_steps SET deleted_at = CURRENT_TIMESTAMP WHERE step_id = $1
    RETURNING *
  `, [stepId]);
  
  if (result.rows.length === 0) {
    throw createError(404, "Step not found");
  }
  
  res.json({ message: "Step deleted successfully" });
});

exports.reorderStep = catchAsync(async (req, res) => {
  const { stepId } = req.params;
  const { direction } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currRes = await client.query(`SELECT roadmap_id, step_order FROM portal.roadmap_steps WHERE step_id = $1 AND deleted_at IS NULL`, [stepId]);
    if (currRes.rows.length === 0) throw createError(404, "Step not found");
    const { roadmap_id, step_order: currOrder } = currRes.rows[0];

    let adjRes;
    if (direction === 'up') {
      adjRes = await client.query(`
        SELECT step_id, step_order FROM portal.roadmap_steps 
        WHERE roadmap_id = $1 AND deleted_at IS NULL AND step_order < $2 
        ORDER BY step_order DESC LIMIT 1
      `, [roadmap_id, currOrder]);
    } else if (direction === 'down') {
      adjRes = await client.query(`
        SELECT step_id, step_order FROM portal.roadmap_steps 
        WHERE roadmap_id = $1 AND deleted_at IS NULL AND step_order > $2 
        ORDER BY step_order ASC LIMIT 1
      `, [roadmap_id, currOrder]);
    } else {
      throw createError(400, "Invalid direction");
    }

    if (adjRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.json({ message: "No action taken" });
    }

    const { step_id: adjId, step_order: adjOrder } = adjRes.rows[0];

    await client.query(`UPDATE portal.roadmap_steps SET step_order = -1 WHERE step_id = $1`, [stepId]);
    await client.query(`UPDATE portal.roadmap_steps SET step_order = $1 WHERE step_id = $2`, [currOrder, adjId]);
    await client.query(`UPDATE portal.roadmap_steps SET step_order = $1 WHERE step_id = $2`, [adjOrder, stepId]);

    await client.query('COMMIT');
    res.json({ message: "Steps reordered successfully" });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// STEP RESOURCES

exports.addResourceToStep = async (req, res) => {
  try {
    const { stepId } = req.params;
    const { resource_id, is_required } = req.body;
    
    await pool.query(`
      INSERT INTO portal.step_resource_map (step_id, resource_id, is_required)
      VALUES ($1, $2, $3)
      ON CONFLICT (step_id, resource_id) DO UPDATE SET is_required = EXCLUDED.is_required
    `, [stepId, resource_id, is_required ?? true]);
    
    res.json({ message: "Resource linked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeResourceFromStep = async (req, res) => {
  try {
    const { stepId, resourceId } = req.params;
    
    await pool.query(`
      DELETE FROM portal.step_resource_map WHERE step_id = $1 AND resource_id = $2
    `, [stepId, resourceId]);
    
    res.json({ message: "Resource unlinked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//// Admin roadmap data management (without moderation)
