const pool = require("../config/db");

// GET pending students
exports.getPendingStudents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.user_id,
        p.full_name,
        a.email,
        pr.program_name,
        p.semester,
        p.tu_registration_no,
        p.student_status
       FROM portal.users p
       JOIN auth.users a ON p.auth_user_id = a.auth_user_id
       LEFT JOIN portal.programs pr ON p.program_id = pr.program_id
       WHERE p.student_status = 'pending_review'
       ORDER BY p.created_at ASC`,
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending students" });
  }
};

// Approve student
exports.approveStudent = async (req, res) => {
  try {
    const { user_id } = req.params;

    await pool.query(
      `UPDATE portal.users
       SET student_status = 'approved'
       WHERE user_id = $1`,
      [user_id],
    );

    res.json({ message: "Student approved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Approval failed" });
  }
};

// Reject student
exports.rejectStudent = async (req, res) => {
  try {
    const { user_id } = req.params;

    await pool.query(
      `UPDATE portal.users
       SET student_status = 'rejected'
       WHERE user_id = $1`,
      [user_id],
    );

    res.json({ message: "Student rejected" });
  } catch (err) {
    res.status(500).json({ error: "Rejection failed" });
  }
};
