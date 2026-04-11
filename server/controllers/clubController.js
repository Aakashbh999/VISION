const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

/* ===============================
   GET CLUB DIRECTORY
 ================================ */
exports.getClubs = catchAsync(async (req, res) => {
  const { search, specialty, institution } = req.query;

  let query = `
      SELECT
        c.id,
        c.club_name,
        c.location,
        c.institution,
        c.specialty,
        c.contact_info,
        c.slug,
        c.logo_url,
        c.website_url
      FROM portal.it_clubs c
      WHERE (c.is_public IS NULL OR c.is_public = 'true' OR c.is_public = true)
    `;

  const values = [];
  let i = 1;

  let orderBy = `c.club_name ASC`;

  if (search) {
    query += ` AND (c.club_name % $${i} OR c.club_name ILIKE $${i + 1})`;
    values.push(search);
    values.push(`%${search}%`);
    orderBy = `similarity(c.club_name, $${i}) DESC, c.club_name ASC`;
    i += 2;
  }

  if (specialty) {
    query += ` AND c.specialty = $${i++}`;
    values.push(specialty);
  }

  if (institution) {
    query += ` AND (c.institution % $${i} OR c.institution ILIKE $${i + 1})`;
    values.push(institution);
    values.push(`%${institution}%`);
    i += 2;
  }

  query += ` ORDER BY ${orderBy}`;

  const result = await pool.query(query, values);

  // If searching and no results found, return recommendations
  if (search && result.rows.length === 0) {
    const {
      userSemester,
      userProgramId,
      userDegreeId,
      portal_user_id: userId,
    } = req.user;
    const recommendationService = require("../services/recommendationService");
    const recommendations = await recommendationService.getRecommendations(
      userId,
      userSemester,
      userProgramId,
      userDegreeId,
      5,
    );
    return res.json({
      clubs: [],
      recommendations,
      noResults: true,
    });
  }

  res.json(result.rows);
});

/* ===============================
   CLUB DETAILS (Directory Profile)
 ================================ */
exports.getClubDetails = catchAsync(async (req, res) => {
  const { id } = req.params;

  const query = `
      SELECT 
        id, 
        slug, 
        club_name, 
        location, 
        institution, 
        specialty, 
        contact_info, 
        description_full,
        website_url, 
        facebook_url, 
        linkedin_url,
        discord_url,
        github_url,
        logo_url,
        banner_url,
        founded_year
      FROM portal.it_clubs 
      WHERE id = $1 AND (is_public IS NULL OR is_public = 'true' OR is_public = true)
    `;

  const result = await pool.query(query, [id]);

  if (!result.rows.length) {
    throw createError(404, "Club not found");
  }

  res.json(result.rows[0]);
});

/* ===============================
   GET SPECIALTIES (for filtering)
 ================================ */
exports.getSpecialties = catchAsync(async (req, res) => {
  const result = await pool.query(`
      SELECT DISTINCT specialty 
      FROM portal.it_clubs 
      WHERE specialty IS NOT NULL 
      ORDER BY specialty
    `);
  res.json(result.rows.map((r) => r.specialty));
});
