const pool = require("../config/db");

/* ============================================
   Pagination Helper
============================================ */
const parsePagination = (req) => {
  let page = parseInt(req.query.page);
  let limit = parseInt(req.query.limit);

  page = page > 0 ? page : 1;
  limit = limit > 0 && limit <= 50 ? limit : 9; // max limit = 50

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/* ============================================
   IT FIELDS
============================================ */
// @desc Get all IT Fields
// @route GET /api/it-fields?page=1&limit=9
exports.getItFields = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req);

    const dataQuery = `
      SELECT *
      FROM portal.it_fields
      ORDER BY id ASC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) FROM portal.it_fields
    `;

    const data = await pool.query(dataQuery, [limit, offset]);
    const totalResult = await pool.query(countQuery);

    const total = parseInt(totalResult.rows[0].count);

    res.json({
      data: data.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching IT fields:", error);
    res.status(500).json({ error: "Failed to fetch IT fields" });
  }
};

/* ============================================
   ACADEMIC DEGREES
============================================ */
// @desc Get all Academic Degrees
// @route GET /api/degrees?page=1&limit=9
exports.getDegrees = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req);

    const dataQuery = `
      SELECT *
      FROM portal.academic_degrees
      ORDER BY id ASC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) FROM portal.academic_degrees
    `;

    const data = await pool.query(dataQuery, [limit, offset]);
    const totalResult = await pool.query(countQuery);

    const total = parseInt(totalResult.rows[0].count);

    res.json({
      data: data.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching degrees:", error);
    res.status(500).json({ error: "Failed to fetch academic degrees" });
  }
};

/* ============================================
   JOB MARKET
============================================ */
// @desc Get all Job Market Insights
// @route GET /api/job-market?page=1&limit=9
exports.getJobMarket = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req);

    const dataQuery = `
      SELECT *
      FROM portal.job_market_insights
      ORDER BY id ASC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) FROM portal.job_market_insights
    `;

    const data = await pool.query(dataQuery, [limit, offset]);
    const totalResult = await pool.query(countQuery);

    const total = parseInt(totalResult.rows[0].count);

    res.json({
      data: data.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching job market data:", error);
    res.status(500).json({ error: "Failed to fetch job market data" });
  }
};

/* ============================================
   IT CLUBS
============================================ */
// @desc Get all IT Clubs
// @route GET /api/it-clubs?page=1&limit=9
exports.getItClubs = async (req, res) => {
  try {
    const { page, limit, offset } = parsePagination(req);

    const dataQuery = `
      SELECT *
      FROM portal.it_clubs
      ORDER BY id ASC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) FROM portal.it_clubs
    `;

    const data = await pool.query(dataQuery, [limit, offset]);
    const totalResult = await pool.query(countQuery);

    const total = parseInt(totalResult.rows[0].count);

    res.json({
      data: data.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching IT clubs:", error);
    res.status(500).json({ error: "Failed to fetch IT clubs" });
  }
};
