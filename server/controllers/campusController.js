const pool = require("../config/db");
const createError = require("http-errors");
const catchAsync = require("../utils/catchAsync");

exports.getActiveCampuses = catchAsync(async (req, res) => {
  const result = await pool.query(
    `SELECT campus_id, campus_name, affiliated_university, location
     FROM portal.campuses
     WHERE is_active = true
     ORDER BY campus_name ASC`
  );
  res.json({
    status: "success",
    data: result.rows,
  });
});

exports.getAllCampuses = catchAsync(async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM portal.campuses ORDER BY created_at DESC`
  );
  res.json({
    status: "success",
    data: result.rows,
  });
});

exports.createCampus = catchAsync(async (req, res) => {
  const { campus_name, affiliated_university, location, contact_email, is_active } = req.body;

  const existing = await pool.query(
    `SELECT 1 FROM portal.campuses WHERE campus_name = $1`,
    [campus_name]
  );

  if (existing.rows.length > 0) {
    throw createError(400, "Campus with this name already exists");
  }

  const result = await pool.query(
    `INSERT INTO portal.campuses
      (campus_name, affiliated_university, location, contact_email, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [campus_name, affiliated_university, location, contact_email, is_active ?? true]
  );

  res.status(201).json({
    status: "success",
    data: result.rows[0],
  });
});

exports.updateCampus = catchAsync(async (req, res) => {
  const { campus_id } = req.params;
  const { campus_name, affiliated_university, location, contact_email, is_active } = req.body;

  const result = await pool.query(
    `UPDATE portal.campuses
     SET campus_name = COALESCE($1, campus_name),
         affiliated_university = COALESCE($2, affiliated_university),
         location = COALESCE($3, location),
         contact_email = COALESCE($4, contact_email),
         is_active = COALESCE($5, is_active)
     WHERE campus_id = $6
     RETURNING *`,
    [campus_name, affiliated_university, location, contact_email, is_active, campus_id]
  );

  if (result.rows.length === 0) {
    throw createError(404, "Campus not found");
  }

  res.json({
    status: "success",
    data: result.rows[0],
  });
});

exports.deleteCampus = catchAsync(async (req, res) => {
  const { campus_id } = req.params;

  const result = await pool.query(
    `DELETE FROM portal.campuses WHERE campus_id = $1 RETURNING campus_id`,
    [campus_id]
  );

  if (result.rows.length === 0) {
    throw createError(404, "Campus not found");
  }

  res.json({
    status: "success",
    message: "Campus deleted successfully"
  });
});
