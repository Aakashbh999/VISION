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
   Column Definitions (Explicit - No SELECT *)
============================================ */
const COLUMNS = {
  it_fields:
    "id, slug, field_name, short_description, description_full, tech_stack_hint, demand_level, icon_name, is_public",
  academic_degrees:
    "id, slug, degree_code, full_name, university, duration, eligibility, focus_area, admission_process, is_public",
  job_market_insights:
    "id, slug, role_name, salary_range, market_demand, key_skills, job_summary, description, is_public",
  it_clubs:
    "id, slug, club_name, location, institution, specialty, is_public, contact_info",
};

/* ============================================
   Reusable Paginated Fetch Helper
============================================ */
const fetchPaginatedData = async (req, res, tableName, orderColumn = "id") => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const columns = COLUMNS[tableName] || "*";

    const dataQuery = `
      SELECT ${columns}
      FROM portal.${tableName}
      ORDER BY ${orderColumn} ASC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) FROM portal.${tableName}
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
    console.error(`Error fetching ${tableName}:`, error);
    res
      .status(500)
      .json({ error: `Failed to fetch ${tableName.replace(/_/g, " ")}` });
  }
};

/* ============================================
   Reusable Slug-Based Fetch Helper
============================================ */
const fetchBySlug = async (req, res, tableName, labelName) => {
  try {
    const { slug } = req.params;
    const columns = COLUMNS[tableName] || "*";

    const query = `
      SELECT ${columns}
      FROM portal.${tableName}
      WHERE slug = $1
    `;

    const result = await pool.query(query, [slug]);

    if (!result.rows.length) {
      return res.status(404).json({ error: `${labelName} not found` });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching ${tableName} by slug:`, error);
    res.status(500).json({ error: `Failed to fetch ${labelName}` });
  }
};

/* ============================================
   IT FIELDS
============================================ */
// @desc Get all IT Fields (paginated)
// @route GET /api/it-fields?page=1&limit=9
exports.getItFields = (req, res) => fetchPaginatedData(req, res, "it_fields");

// @desc Get single IT Field by slug
// @route GET /api/it-fields/:slug
exports.getItFieldBySlug = (req, res) =>
  fetchBySlug(req, res, "it_fields", "IT Field");

/* ============================================
   ACADEMIC DEGREES
============================================ */
// @desc Get all Academic Degrees (paginated)
// @route GET /api/academic-degrees?page=1&limit=9
exports.getDegrees = (req, res) =>
  fetchPaginatedData(req, res, "academic_degrees");

// @desc Get single Academic Degree by slug
// @route GET /api/academic-degrees/:slug
exports.getDegreeBySlug = (req, res) =>
  fetchBySlug(req, res, "academic_degrees", "Academic Degree");

/* ============================================
   JOB MARKET
============================================ */
// @desc Get all Job Market Insights (paginated)
// @route GET /api/job-market?page=1&limit=9
exports.getJobMarket = (req, res) =>
  fetchPaginatedData(req, res, "job_market_insights");

// @desc Get single Job Market Insight by slug
// @route GET /api/job-market/:slug
exports.getJobMarketBySlug = (req, res) =>
  fetchBySlug(req, res, "job_market_insights", "Job Market Insight");

/* ============================================
   IT CLUBS
============================================ */
// @desc Get all IT Clubs (paginated)
// @route GET /api/it-clubs?page=1&limit=9
exports.getItClubs = (req, res) => fetchPaginatedData(req, res, "it_clubs");

// @desc Get single IT Club by slug
// @route GET /api/it-clubs/:slug
exports.getItClubBySlug = (req, res) =>
  fetchBySlug(req, res, "it_clubs", "IT Club");
