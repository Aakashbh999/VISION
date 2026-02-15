const pool = require("../config/db");

// @desc Get all IT Fields
// @route GET /api/it-fields
exports.getItFields = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM it_fields ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching IT fields:", err.message);
    res.status(500).json({ error: "Failed to fetch IT fields" });
  }
};

// @desc Get all Academic Degrees
// @route GET /api/academic-degrees
exports.getDegrees = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM academic_degrees ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching degrees:", err.message);
    res.status(500).json({ error: "Failed to fetch academic degrees" });
  }
};

// @desc Get all Job Market Insights
// @route GET /api/job-market
exports.getJobMarket = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM job_market_insights ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching job market:", err.message);
    res.status(500).json({ error: "Failed to fetch job market data" });
  }
};

// @desc Get all IT Clubs
// @route GET /api/it-clubs
exports.getItClubs = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM it_clubs ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching IT clubs:", err.message);
    res.status(500).json({ error: "Failed to fetch IT clubs" });
  }
};
