/**
 * Market Insights Service
 * Intelligence layer for job market analytics
 * All SQL queries centralized here - controllers only call these functions
 */

const pool = require("../config/db");

/**
 * Get overview statistics for a specific IT field
 * @param {number} fieldId - IT field ID
 * @returns {Object} Field overview with job count, avg salary, top skills, experience ratio
 */
const getFieldOverview = async (fieldId) => {
  // Get field info with job statistics
  const fieldQuery = `
    SELECT 
      f.id,
      f.slug,
      f.field_name,
      f.short_description,
      f.description_full,
      f.demand_level,
      f.icon_name,
      f.average_salary,
      f.growth_rate,
      COUNT(j.job_id) as total_jobs,
      COALESCE(AVG((j.salary_min + j.salary_max) / 2), 0)::INTEGER as calculated_avg_salary,
      COUNT(CASE WHEN j.experience_level = 'entry' THEN 1 END) as entry_jobs,
      COUNT(CASE WHEN j.experience_level = 'mid' THEN 1 END) as mid_jobs,
      COUNT(CASE WHEN j.experience_level = 'senior' THEN 1 END) as senior_jobs
    FROM portal.it_fields f
    LEFT JOIN portal.jobs j ON j.field_id = f.id AND j.is_active = true
    WHERE f.id = $1
    GROUP BY f.id
  `;

  // Get top 5 skills for this field
  const skillsQuery = `
    SELECT 
      s.skill_id,
      s.name,
      s.category,
      COUNT(js.job_id) as demand_count,
      COALESCE(fs.importance_score, 0) as importance_score
    FROM portal.skills s
    LEFT JOIN portal.job_skills js ON js.skill_id = s.skill_id
    LEFT JOIN portal.jobs j ON j.job_id = js.job_id AND j.field_id = $1 AND j.is_active = true
    LEFT JOIN portal.field_skills fs ON fs.skill_id = s.skill_id AND fs.field_id = $1
    WHERE js.job_id IS NOT NULL OR fs.field_id IS NOT NULL
    GROUP BY s.skill_id, s.name, s.category, fs.importance_score
    ORDER BY demand_count DESC, importance_score DESC
    LIMIT 5
  `;

  const [fieldResult, skillsResult] = await Promise.all([
    pool.query(fieldQuery, [fieldId]),
    pool.query(skillsQuery, [fieldId]),
  ]);

  if (fieldResult.rows.length === 0) {
    return null;
  }

  const field = fieldResult.rows[0];
  const totalJobs =
    parseInt(field.entry_jobs) +
    parseInt(field.mid_jobs) +
    parseInt(field.senior_jobs);

  return {
    ...field,
    top_skills: skillsResult.rows,
    experience_distribution: {
      entry: parseInt(field.entry_jobs),
      mid: parseInt(field.mid_jobs),
      senior: parseInt(field.senior_jobs),
      entry_percentage: totalJobs > 0 ? Math.round((field.entry_jobs / totalJobs) * 100) : 0,
      senior_percentage: totalJobs > 0 ? Math.round((field.senior_jobs / totalJobs) * 100) : 0,
    },
  };
};

/**
 * Get top skills by demand for a specific field
 * @param {number} fieldId - IT field ID
 * @param {number} limit - Max skills to return (default 10)
 * @returns {Array} Skills sorted by demand frequency
 */
const getTopSkillsByField = async (fieldId, limit = 10) => {
  const query = `
    SELECT 
      s.skill_id,
      s.name,
      s.category,
      COUNT(js.job_id) as demand_count,
      ROUND(COUNT(js.job_id)::DECIMAL / NULLIF(
        (SELECT COUNT(*) FROM portal.jobs WHERE field_id = $1 AND is_active = true), 0
      ) * 100, 1) as demand_percentage
    FROM portal.skills s
    JOIN portal.job_skills js ON js.skill_id = s.skill_id
    JOIN portal.jobs j ON j.job_id = js.job_id
    WHERE j.field_id = $1 AND j.is_active = true
    GROUP BY s.skill_id, s.name, s.category
    ORDER BY demand_count DESC
    LIMIT $2
  `;

  const result = await pool.query(query, [fieldId, limit]);
  return result.rows;
};

/**
 * Get salary distribution by experience level for a field
 * @param {number} fieldId - IT field ID
 * @returns {Object} Salary stats grouped by experience level
 */
const getSalaryDistribution = async (fieldId) => {
  const query = `
    SELECT 
      experience_level,
      COUNT(*) as job_count,
      MIN(salary_min) as min_salary,
      MAX(salary_max) as max_salary,
      AVG((salary_min + salary_max) / 2)::INTEGER as avg_salary,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (salary_min + salary_max) / 2)::INTEGER as median_salary
    FROM portal.jobs
    WHERE field_id = $1 
      AND is_active = true 
      AND salary_min IS NOT NULL 
      AND salary_max IS NOT NULL
    GROUP BY experience_level
    ORDER BY 
      CASE experience_level 
        WHEN 'entry' THEN 1 
        WHEN 'mid' THEN 2 
        WHEN 'senior' THEN 3 
      END
  `;

  const result = await pool.query(query, [fieldId]);

  // Calculate overall stats
  const overallQuery = `
    SELECT 
      MIN(salary_min) as min_salary,
      MAX(salary_max) as max_salary,
      AVG((salary_min + salary_max) / 2)::INTEGER as avg_salary
    FROM portal.jobs
    WHERE field_id = $1 AND is_active = true AND salary_min IS NOT NULL
  `;

  const overallResult = await pool.query(overallQuery, [fieldId]);

  return {
    by_experience: result.rows,
    overall: overallResult.rows[0],
  };
};

/**
 * Get trending fields based on job count and growth
 * @param {number} limit - Max fields to return
 * @returns {Array} Fields sorted by demand/trending score
 */
const getTrendingFields = async (limit = 10) => {
  const query = `
    SELECT 
      f.id,
      f.slug,
      f.field_name,
      f.short_description,
      f.demand_level,
      f.icon_name,
      f.average_salary,
      f.growth_rate,
      COUNT(j.job_id) as job_count,
      COALESCE(AVG((j.salary_min + j.salary_max) / 2), 0)::INTEGER as calculated_avg_salary
    FROM portal.it_fields f
    LEFT JOIN portal.jobs j ON j.field_id = f.id AND j.is_active = true
    WHERE f.is_public IS NULL OR f.is_public = true
    GROUP BY f.id
    ORDER BY 
      job_count DESC,
      CASE f.demand_level 
        WHEN 'High' THEN 3 
        WHEN 'Medium' THEN 2 
        WHEN 'Low' THEN 1 
        ELSE 0 
      END DESC,
      f.growth_rate DESC NULLS LAST
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);
  return result.rows;
};

/**
 * Get all IT fields with analytics data
 * @param {Object} options - Pagination and filtering options
 * @returns {Object} Paginated fields with analytics
 */
const getAllFields = async ({ page = 1, limit = 10, demandLevel = null }) => {
  const offset = (page - 1) * limit;

  let whereClause = "WHERE (f.is_public IS NULL OR f.is_public = true)";
  const params = [limit, offset];

  if (demandLevel) {
    whereClause += ` AND f.demand_level = $3`;
    params.push(demandLevel);
  }

  const query = `
    SELECT 
      f.id,
      f.slug,
      f.field_name,
      f.short_description,
      f.demand_level,
      f.icon_name,
      f.average_salary,
      f.growth_rate,
      COUNT(j.job_id) as job_count
    FROM portal.it_fields f
    LEFT JOIN portal.jobs j ON j.field_id = f.id AND j.is_active = true
    ${whereClause}
    GROUP BY f.id
    ORDER BY job_count DESC, f.field_name
    LIMIT $1 OFFSET $2
  `;

  const countQuery = `
    SELECT COUNT(*) FROM portal.it_fields f
    ${whereClause.replace("$3", "$1")}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, demandLevel ? [demandLevel] : []),
  ]);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].count),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    },
  };
};

/**
 * Search and filter jobs
 * @param {Object} filters - Search filters
 * @returns {Object} Paginated job results
 */
const searchJobs = async ({
  fieldId = null,
  experienceLevel = null,
  salaryMin = null,
  salaryMax = null,
  skillIds = [],
  isRemote = null,
  search = null,
  page = 1,
  limit = 20,
}) => {
  const offset = (page - 1) * limit;
  const conditions = ["j.is_active = true"];
  const params = [];
  let paramIndex = 1;

  if (fieldId) {
    conditions.push(`j.field_id = $${paramIndex++}`);
    params.push(fieldId);
  }

  if (experienceLevel) {
    conditions.push(`j.experience_level = $${paramIndex++}`);
    params.push(experienceLevel);
  }

  if (salaryMin) {
    conditions.push(`j.salary_max >= $${paramIndex++}`);
    params.push(salaryMin);
  }

  if (salaryMax) {
    conditions.push(`j.salary_min <= $${paramIndex++}`);
    params.push(salaryMax);
  }

  if (isRemote !== null) {
    conditions.push(`j.is_remote = $${paramIndex++}`);
    params.push(isRemote);
  }

  if (search) {
    conditions.push(`(j.title ILIKE $${paramIndex} OR j.company ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex})`);
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Handle skill filtering with subquery
  let skillJoin = "";
  if (skillIds && skillIds.length > 0) {
    skillJoin = `
      AND j.job_id IN (
        SELECT job_id FROM portal.job_skills 
        WHERE skill_id = ANY($${paramIndex++})
        GROUP BY job_id
        HAVING COUNT(DISTINCT skill_id) >= 1
      )
    `;
    params.push(skillIds);
  }

  const whereClause = conditions.join(" AND ");

  const query = `
    SELECT 
      j.job_id,
      j.title,
      j.company,
      j.location,
      j.salary_min,
      j.salary_max,
      j.experience_level,
      j.is_remote,
      j.posted_at,
      f.field_name,
      f.slug as field_slug,
      ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as skills
    FROM portal.jobs j
    LEFT JOIN portal.it_fields f ON f.id = j.field_id
    LEFT JOIN portal.job_skills js ON js.job_id = j.job_id
    LEFT JOIN portal.skills s ON s.skill_id = js.skill_id
    WHERE ${whereClause} ${skillJoin}
    GROUP BY j.job_id, f.field_name, f.slug
    ORDER BY j.posted_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex}
  `;

  params.push(limit, offset);

  const countQuery = `
    SELECT COUNT(DISTINCT j.job_id)
    FROM portal.jobs j
    WHERE ${whereClause} ${skillJoin.replace(`$${paramIndex - 2}`, `$${params.length - 1}`)}
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, params.slice(0, -2)),
  ]);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].count),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    },
  };
};

/**
 * Get all skills with optional category filter
 * @param {string} category - Optional category filter
 * @returns {Array} Skills list
 */
const getAllSkills = async (category = null) => {
  let query = `
    SELECT skill_id, name, category
    FROM portal.skills
  `;
  const params = [];

  if (category) {
    query += ` WHERE category = $1`;
    params.push(category);
  }

  query += ` ORDER BY category, name`;

  const result = await pool.query(query, params);
  return result.rows;
};

/**
 * Get market statistics summary
 * @returns {Object} Overall market stats
 */
const getMarketStats = async () => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM portal.jobs WHERE is_active = true) as total_jobs,
      (SELECT COUNT(*) FROM portal.it_fields WHERE is_public IS NULL OR is_public = true) as total_fields,
      (SELECT COUNT(*) FROM portal.skills) as total_skills,
      (SELECT COUNT(DISTINCT company) FROM portal.jobs WHERE is_active = true) as total_companies,
      (SELECT AVG((salary_min + salary_max) / 2)::INTEGER FROM portal.jobs WHERE is_active = true AND salary_min IS NOT NULL) as avg_salary,
      (SELECT COUNT(*) FROM portal.jobs WHERE is_active = true AND is_remote = true) as remote_jobs
  `;

  const result = await pool.query(query);
  return result.rows[0];
};

/**
 * Get comparison between two fields
 * @param {number} fieldId1 - First field ID
 * @param {number} fieldId2 - Second field ID
 * @returns {Object} Comparison data
 */
const compareFields = async (fieldId1, fieldId2) => {
  const [field1, field2] = await Promise.all([
    getFieldOverview(fieldId1),
    getFieldOverview(fieldId2),
  ]);

  if (!field1 || !field2) {
    return null;
  }

  return {
    field1,
    field2,
    comparison: {
      salary_difference: (field1.calculated_avg_salary || 0) - (field2.calculated_avg_salary || 0),
      job_count_difference: parseInt(field1.total_jobs) - parseInt(field2.total_jobs),
      common_skills: field1.top_skills.filter(s1 =>
        field2.top_skills.some(s2 => s2.skill_id === s1.skill_id)
      ),
    },
  };
};

module.exports = {
  getFieldOverview,
  getTopSkillsByField,
  getSalaryDistribution,
  getTrendingFields,
  getAllFields,
  searchJobs,
  getAllSkills,
  getMarketStats,
  compareFields,
};
