const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");

const parsePagination = (req) => {
  let page = parseInt(req.query.page);
  let limit = parseInt(req.query.limit);

  page = page > 0 ? page : 1;
  limit = limit > 0 && limit <= 50 ? limit : 9;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

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

const fetchPaginatedData = async (req, res, tableName, orderColumn = "id") => {

  if (!COLUMNS[tableName]) {
    return res.status(400).json({ error: "Invalid table requested" });
  }

  const { page, limit, offset } = parsePagination(req);
  const columns = COLUMNS[tableName];

  const dataQuery = `
      SELECT ${columns}
      FROM portal.${tableName}
      WHERE is_public = true
      ORDER BY ${orderColumn} ASC
      LIMIT $1 OFFSET $2
    `;

  const countQuery = `
      SELECT COUNT(*)
      FROM portal.${tableName}
      WHERE is_public = true
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
};

const fetchBySlug = async (req, res, tableName, labelName) => {
  if (!COLUMNS[tableName]) {
    return res.status(400).json({ error: "Invalid table requested" });
  }

  const { slug } = req.params;
  const columns = COLUMNS[tableName];

  const query = `
      SELECT ${columns}
      FROM portal.${tableName}
      WHERE slug = $1 AND is_public = true
      LIMIT 1
    `;

  const result = await pool.query(query, [slug]);

  if (!result.rows.length) {
    return res.status(404).json({ error: `${labelName} not found` });
  }

  return res.json(result.rows[0]);
};

exports.getItFields = catchAsync(async (req, res) =>
  fetchPaginatedData(req, res, "it_fields"),
);

exports.getItFieldBySlug = catchAsync(async (req, res) =>
  fetchBySlug(req, res, "it_fields", "IT Field"),
);

exports.getDegrees = catchAsync(async (req, res) =>
  fetchPaginatedData(req, res, "academic_degrees"),
);

exports.getDegreeBySlug = catchAsync(async (req, res) =>
  fetchBySlug(req, res, "academic_degrees", "Academic Degree"),
);

exports.getJobMarket = catchAsync(async (req, res) =>
  fetchPaginatedData(req, res, "job_market_insights"),
);

exports.getJobMarketBySlug = catchAsync(async (req, res) =>
  fetchBySlug(req, res, "job_market_insights", "Job Market Insight"),
);

exports.getItClubs = catchAsync(async (req, res) => {
  const { page, limit, offset } = parsePagination(req);
  const { search, specialty, institution } = req.query;
  const columns = COLUMNS.it_clubs;

  let whereClauses = ["is_public = true"];
  let values = [];
  let i = 1;

  if (search) {
    whereClauses.push(`(club_name ILIKE $${i} OR club_name % $${i})`);
    values.push(`%${search}%`);
    i++;
  }
  if (specialty) {
    whereClauses.push(`specialty ILIKE $${i}`);
    values.push(`%${specialty}%`);
    i++;
  }
  if (institution) {
    whereClauses.push(`institution ILIKE $${i}`);
    values.push(`%${institution}%`);
    i++;
  }

  let whereSQL = whereClauses.length
    ? `WHERE ${whereClauses.join(" AND ")}`
    : "";

  const dataQuery = `
    SELECT ${columns}
    FROM portal.it_clubs
    ${whereSQL}
    ORDER BY id ASC
    LIMIT $${i} OFFSET $${i + 1}
  `;
  values.push(limit, offset);

  const countQuery = `
    SELECT COUNT(*)
    FROM portal.it_clubs
    ${whereSQL}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataQuery, values),
    pool.query(countQuery, values.slice(0, values.length - 2)),
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
});

exports.getItClubBySlug = catchAsync(async (req, res) =>
  fetchBySlug(req, res, "it_clubs", "IT Club"),
);

exports.getSystemTags = catchAsync(async (req, res) => {
  const result = await pool.query(
    `SELECT tag_id, name, slug
     FROM portal.tags
     WHERE tag_type = 'system'
     ORDER BY name ASC`
  );

  res.json({
    success: true,
    data: result.rows
  });
});
