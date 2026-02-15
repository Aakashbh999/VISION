const pool = require("../config/db");

exports.getMe = async (req, res) => {
  try {
    const { auth_user_id } = req.user;

    const result = await pool.query(
      `SELECT 
        a.email,
        a.email_status,
        p.full_name,
        p.semester,
        p.student_status,
        pr.program_name
       FROM auth.users a
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       LEFT JOIN portal.programs pr ON p.program_id = pr.program_id
       WHERE a.auth_user_id = $1`,
      [auth_user_id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};
