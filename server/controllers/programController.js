const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");

exports.getPrograms = catchAsync(async (req, res) => {
    const result = await pool.query(
      `SELECT program_id, program_name
       FROM portal.programs
       ORDER BY program_id ASC`,
    );

    res.json(result.rows);
});
