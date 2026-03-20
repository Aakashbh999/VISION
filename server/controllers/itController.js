const pool = require("../config/db");

/* ============================================
   Pagination Helper
============================================ */
const parsePagination = (req) => {
  let page = parseInt(req.query.page);
  let limit = parseInt(req.query.limit);

  page = page > 0 ? page : 1;
  limit = limit > 0 && limit <= 50 ? limit : 9;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/* ============================================
   Explicit Column Definitions
   (Never allow SELECT *)
============================================ */
const COLUMNS = {
  it_fields:
    "id, slug, field_name, short_description, description_full, tech_stack_hint, demand_level, icon_name",

  academic_degrees:
    "id, slug, degree_code, full_name, university, duration, eligibility, focus_area, admission_process",

  job_market_insights:
    "id, slug, role_name, salary_range, market_demand, key_skills, job_summary, description",

  it_clubs:
    "id, slug, club_name, location, institution, specialty, contact_info, logo_url, website_url, facebook_url, linkedin_url, discord_url, github_url, banner_url, founded_year, description_full",
};

/* ============================================
   Reusable Paginated Fetch Helper
============================================ */
const fetchPaginatedData = async (req, res, tableName, orderColumn = "id") => {
  try {
    // Validate table name
    if (!COLUMNS[tableName]) {
      return res.status(400).json({ error: "Invalid table requested" });
    }

    const { page, limit, offset } = parsePagination(req);
    const columns = COLUMNS[tableName];

    const dataQuery = `
      SELECT ${columns}
      FROM portal.${tableName}
      ORDER BY ${orderColumn} ASC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*)
      FROM portal.${tableName}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [limit, offset]),
      pool.query(countQuery),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return res.json({
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(`Error fetching ${tableName}:`, error);
    return res
      .status(500)
      .json({ error: `Failed to fetch ${tableName.replace(/_/g, " ")}` });
  }
};

/* ============================================
   Reusable Slug-Based Fetch Helper
============================================ */
const fetchBySlug = async (req, res, tableName, labelName) => {
  try {
    if (!COLUMNS[tableName]) {
      return res.status(400).json({ error: "Invalid table requested" });
    }

    const { slug } = req.params;
    const columns = COLUMNS[tableName];

    const query = `
      SELECT ${columns}
      FROM portal.${tableName}
      WHERE slug = $1
      LIMIT 1
    `;

    const result = await pool.query(query, [slug]);

    if (!result.rows.length) {
      return res.status(404).json({ error: `${labelName} not found` });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching ${tableName} by slug:`, error);
    return res.status(500).json({ error: `Failed to fetch ${labelName}` });
  }
};

/* ============================================
   IT FIELDS
============================================ */

// GET /api/it-fields?page=1&limit=9
exports.getItFields = (req, res) => fetchPaginatedData(req, res, "it_fields");

// GET /api/it-fields/:slug
exports.getItFieldBySlug = (req, res) =>
  fetchBySlug(req, res, "it_fields", "IT Field");

/* ============================================
   ACADEMIC DEGREES
============================================ */

// GET /api/academic-degrees?page=1&limit=9
exports.getDegrees = (req, res) =>
  fetchPaginatedData(req, res, "academic_degrees");

// GET /api/academic-degrees/:slug
exports.getDegreeBySlug = (req, res) =>
  fetchBySlug(req, res, "academic_degrees", "Academic Degree");

/* ============================================
   JOB MARKET
============================================ */

// GET /api/job-market?page=1&limit=9
exports.getJobMarket = (req, res) =>
  fetchPaginatedData(req, res, "job_market_insights");

// GET /api/job-market/:slug
exports.getJobMarketBySlug = (req, res) =>
  fetchBySlug(req, res, "job_market_insights", "Job Market Insight");

/* ============================================
   IT CLUBS
============================================ */

// GET /api/it-clubs?page=1&limit=9
exports.getItClubs = (req, res) => fetchPaginatedData(req, res, "it_clubs");

// GET /api/it-clubs/:slug
exports.getItClubBySlug = (req, res) =>
  fetchBySlug(req, res, "it_clubs", "IT Club");
