const pool = require("../config/db");

/* ===============================
   GET Pending Students
================================ */
exports.getPendingStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.user_id,
        p.full_name,
        a.email,
        pr.program_name,
        p.semester,
        p.tu_registration_no,
        p.student_status,
        p.created_at
      FROM portal.users p
      JOIN auth.users a ON p.auth_user_id = a.auth_user_id
      LEFT JOIN portal.programs pr ON p.program_id = pr.program_id
      WHERE p.student_status = 'pending_review'
      ORDER BY p.created_at ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending students" });
  }
};

/* ===============================
   GET Students By Status
================================ */
exports.getStudentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        p.user_id,
        p.full_name,
        a.email,
        p.student_status,
        p.created_at
      FROM portal.users p
      JOIN auth.users a ON p.auth_user_id = a.auth_user_id
    `;

    const values = [];

    if (status) {
      query += ` WHERE p.student_status = $1`;
      values.push(status);
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

/* ===============================
   APPROVE Student
================================ */
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
    console.error(err);
    res.status(500).json({ error: "Failed to approve student" });
  }
};

/* ===============================
   REJECT Student
================================ */
exports.rejectStudent = async (req, res) => {
  try {
    const { user_id } = req.params;

    await pool.query(
      `UPDATE portal.users
       SET student_status = 'rejected'
       WHERE user_id = $1`,
      [user_id],
    );

    res.json({ message: "Student rejected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Rejection failed" });
  }
};

/* ===============================
   STUDENT STATS
================================ */
exports.getStudentStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE student_status = 'pending_review') AS pending,
        COUNT(*) FILTER (WHERE student_status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE student_status = 'rejected') AS rejected
      FROM portal.users
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
