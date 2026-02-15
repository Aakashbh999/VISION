const pool = require("../config/db");

// GET /api/programs
exports.getPrograms = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT program_id, program_name
       FROM portal.programs
       ORDER BY program_id ASC`,
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch programs" });
  }
};
