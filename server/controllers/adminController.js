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
    const adminId = req.user.portal_user_id;

    const result = await pool.query(
      `
      UPDATE portal.users
      SET student_status = 'approved'
      WHERE user_id = $1
      AND student_status != 'approved'
      RETURNING user_id
      `,
      [user_id],
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Already approved or not found" });
    }

    await pool.query(
      `
      INSERT INTO portal.moderation_logs
      (admin_user_id, action_type, target_type, target_id)
      VALUES ($1, 'approve', 'user', $2)
      `,
      [adminId, user_id],
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
    const adminId = req.user.portal_user_id;

    const result = await pool.query(
      `
      UPDATE portal.users
      SET student_status = 'rejected'
      WHERE user_id = $1
      AND student_status != 'rejected'
      RETURNING user_id
      `,
      [user_id],
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Already rejected or not found" });
    }

    await pool.query(
      `
      INSERT INTO portal.moderation_logs
      (admin_user_id, action_type, target_type, target_id)
      VALUES ($1, 'reject', 'user', $2)
      `,
      [adminId, user_id],
    );

    res.json({ message: "Student rejected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject student" });
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

/* ===============================
   SOFT DELETE DISCUSSION
================================ */
exports.deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.portal_user_id;

    const result = await pool.query(
      `
      UPDATE portal.discussions
      SET is_deleted = TRUE
      WHERE discussion_id = $1
      AND is_deleted = FALSE
      RETURNING discussion_id
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Discussion not found or already deleted" });
    }

    // Log action
    await pool.query(
      `
      INSERT INTO portal.moderation_logs
      (admin_user_id, action_type, target_type, target_id)
      VALUES ($1, 'delete', 'discussion', $2)
      `,
      [adminId, id],
    );

    res.json({ message: "Discussion deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete discussion" });
  }
};

/* ===============================
  GET ALL REPORTS
================================ */
exports.getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const reports = await pool.query(
      `
      SELECT *
      FROM portal.reports
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const total = await pool.query(`
      SELECT COUNT(*) FROM portal.reports
    `);

    res.json({
      data: reports.rows,
      total: total.rows[0].count,
      page
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

/* ===============================
  CLOSE REPORT
================================ */
exports.closeReport = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE portal.reports
      SET status = 'closed'
      WHERE report_id = $1
      `,
      [id],
    );

    res.json({ message: "Report closed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to close report" });
  }
};

/* ===============================
  SUSPEND ROUTE
================================ */

exports.suspendUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const adminId = req.user.portal_user_id;

    const result = await pool.query(
      `
      UPDATE portal.users
      SET is_suspended = TRUE
      WHERE user_id = $1
      RETURNING user_id
      `,
      [user_id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await pool.query(
      `
      INSERT INTO portal.moderation_logs
      (admin_user_id, action_type, target_type, target_id)
      VALUES ($1, 'suspend', 'user', $2)
      `,
      [adminId, user_id],
    );

    res.json({ message: "User suspended successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to suspend user" });
  }
};

/* ===============================
  REACTIVATE ROUTE
================================ */
exports.reactivateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const adminId = req.user.portal_user_id;

    await pool.query(
      `
      UPDATE portal.users
      SET is_suspended = FALSE
      WHERE user_id = $1
      `,
      [user_id],
    );

    await pool.query(
      `
      INSERT INTO portal.moderation_logs
      (admin_user_id, action_type, target_type, target_id)
      VALUES ($1, 'reactivate', 'user', $2)
      `,
      [adminId, user_id],
    );

    res.json({ message: "User reactivated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reactivate user" });
  }
};

/* ===============================
  Admin Dashboard Aggregation Endpoint
================================ */
exports.getAdminDashboard = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE student_status = 'pending_review') AS pending,
        COUNT(*) FILTER (WHERE student_status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE student_status = 'rejected') AS rejected,
        COUNT(*) FILTER (WHERE is_suspended = TRUE) AS suspended
      FROM portal.users
    `);

    const openReports = await pool.query(`
      SELECT COUNT(*) FROM portal.reports
      WHERE status = 'open'
    `);

    const deletedDiscussions = await pool.query(`
      SELECT COUNT(*) FROM portal.discussions
      WHERE is_deleted = TRUE
    `);

    res.json({
      users: stats.rows[0],
      reports_open: openReports.rows[0].count,
      deleted_discussions: deletedDiscussions.rows[0].count,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load admin dashboard" });
  }
};

/* ===============================
  Audit log viewer
================================ */
exports.getModerationLogs = async (req, res) => {
  try {
    const logs = await pool.query(`
      SELECT *
      FROM portal.moderation_logs
      ORDER BY created_at DESC
      LIMIT 50
    `);

    res.json(logs.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};