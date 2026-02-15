const pool = require("../config/db");

exports.getAllRoadmaps = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT roadmap_id, title, description, difficulty_level
      FROM portal.roadmaps
      ORDER BY roadmap_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roadmaps" });
  }
};

exports.getRoadmapDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const roadmap = await pool.query(
      `SELECT * FROM portal.roadmaps WHERE roadmap_id = $1`,
      [id],
    );

    const steps = await pool.query(
      `SELECT step_id, title, description, step_order, estimated_time
       FROM portal.roadmap_steps
       WHERE roadmap_id = $1
       ORDER BY step_order`,
      [id],
    );

    res.json({
      roadmap: roadmap.rows[0],
      steps: steps.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch roadmap details" });
  }
};

exports.getStepResources = async (req, res) => {
  try {
    const { stepId } = req.params;

    const resources = await pool.query(
      `SELECT r.resource_id, r.title, r.url, r.resource_type
       FROM portal.step_resources sr
       JOIN portal.resources r ON r.resource_id = sr.resource_id
       WHERE sr.step_id = $1`,
      [stepId]
    );

    res.json(resources.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch step resources" });
  }
};
