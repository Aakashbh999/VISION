const pool = require("../config/db");
const {
  AuditActions,
  logAdminEvent,
  getAuditLogs,
  getAuditLogsCount,
} = require("../utils/auditService");

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
      SET deleted_at = NOW()
      WHERE discussion_id = $1
      AND deleted_at IS NULL
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
   RESTORE DISCUSSION (Admin)
================================ */
exports.restoreDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.portal_user_id;

    const result = await pool.query(
      `
      UPDATE portal.discussions
      SET deleted_at = NULL
      WHERE discussion_id = $1
      AND deleted_at IS NOT NULL
      RETURNING discussion_id
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Discussion not found or not deleted" });
    }

    await pool.query(
      `
      INSERT INTO portal.moderation_logs
      (admin_user_id, action_type, target_type, target_id)
      VALUES ($1, 'restore', 'discussion', $2)
      `,
      [adminId, id],
    );

    res.json({ message: "Discussion restored successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to restore discussion" });
  }
};

/* ===============================
   HARD DELETE DISCUSSION (Admin)
================================ */
exports.hardDeleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.portal_user_id;

    // Wait, let's make sure it exists
    const result = await pool.query(
      `DELETE FROM portal.discussions WHERE discussion_id = $1 RETURNING discussion_id`,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Discussion not found" });
    }

    await pool.query(
      `
      INSERT INTO portal.moderation_logs
      (admin_user_id, action_type, target_type, target_id)
      VALUES ($1, 'hard_delete', 'discussion', $2)
      `,
      [adminId, id],
    );

    res.json({ message: "Discussion permanently deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to permanently delete discussion" });
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
      [limit, offset],
    );

    const total = await pool.query(`
      SELECT COUNT(*) FROM portal.reports
    `);

    res.json({
      data: reports.rows,
      total: total.rows[0].count,
      page,
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
      WHERE deleted_at IS NOT NULL
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
  Audit log viewer (legacy moderation logs)
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

/* ===============================
  Comprehensive Audit Logs
================================ */
exports.getAuditLogs = async (req, res) => {
  try {
    const { adminId, action, targetType, page = 1, limit = 50 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      getAuditLogs({
        adminUserId: adminId ? parseInt(adminId) : null,
        actionType: action,
        targetType,
        limit: parseInt(limit),
        offset,
      }),
      getAuditLogsCount({
        adminUserId: adminId ? parseInt(adminId) : null,
        actionType: action,
        targetType,
      }),
    ]);

    res.json({
      data: logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};

/* ===============================
  Get audit log actions summary
================================ */
exports.getAuditLogsSummary = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    // Get summary from existing moderation_logs table
    const result = await pool.query(
      `SELECT 
         action_type,
         target_type,
         COUNT(*) as count,
         DATE_TRUNC('day', created_at) as date
       FROM portal.moderation_logs
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       GROUP BY action_type, target_type, DATE_TRUNC('day', created_at)
       ORDER BY date DESC, count DESC`,
      [parseInt(days)],
    );

    // Get action counts
    const actionCounts = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE action_type = 'approve') as approvals,
         COUNT(*) FILTER (WHERE action_type = 'reject') as rejections,
         COUNT(*) FILTER (WHERE action_type = 'suspend') as suspensions,
         COUNT(*) FILTER (WHERE action_type = 'delete') as deletions
       FROM portal.moderation_logs
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1`,
      [parseInt(days)],
    );

    res.json({
      breakdown: result.rows,
      summary: actionCounts.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch audit summary" });
  }
};

/* ===============================
  Get user activity (for user profile/admin view)
================================ */
exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    // Get moderation actions targeting this user
    const result = await pool.query(
      `SELECT 
         ml.log_id,
         ml.action_type,
         ml.target_type,
         ml.created_at,
         pu.full_name as admin_name
       FROM portal.moderation_logs ml
       LEFT JOIN portal.users pu ON ml.admin_user_id = pu.user_id
       WHERE ml.target_type = 'user' AND ml.target_id = $1
       ORDER BY ml.created_at DESC
       LIMIT $2`,
      [parseInt(userId), parseInt(limit)],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user activity" });
  }
};

/* ===============================
  Get active sessions for admin view
  NOTE: Requires device_sessions table to be added
================================ */
exports.getActiveSessions = async (req, res) => {
  try {
    // Check if device_sessions table exists
    const tableExists = await pool.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'auth' 
         AND table_name = 'device_sessions'
       )`,
    );

    if (!tableExists.rows[0].exists) {
      // Return recent logins from auth.users instead
      const result = await pool.query(`
        SELECT 
          au.auth_user_id,
          au.email,
          pu.full_name,
          au.last_login,
          au.created_at
        FROM auth.users au
        LEFT JOIN portal.users pu ON au.auth_user_id = pu.auth_user_id
        WHERE au.last_login IS NOT NULL
        ORDER BY au.last_login DESC
        LIMIT 100
      `);
      return res.json(result.rows);
    }

    const result = await pool.query(`
      SELECT 
        ds.session_id,
        ds.auth_user_id,
        au.email,
        pu.full_name,
        ds.device_name,
        ds.device_type,
        ds.browser,
        ds.os,
        ds.ip_address,
        ds.last_active_at,
        ds.created_at
      FROM auth.device_sessions ds
      JOIN auth.users au ON ds.auth_user_id = au.auth_user_id
      LEFT JOIN portal.users pu ON au.auth_user_id = pu.auth_user_id
      WHERE ds.last_active_at >= NOW() - INTERVAL '7 days'
      ORDER BY ds.last_active_at DESC
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch active sessions" });
  }
};

/* ===============================
  Force logout user (admin action)
  NOTE: Full implementation requires refresh_tokens table
================================ */
exports.forceLogoutUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.portal_user_id;

    // Check if refresh_tokens table exists for full logout
    const tableExists = await pool.query(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables 
         WHERE table_schema = 'auth' 
         AND table_name = 'refresh_tokens'
       )`,
    );

    if (tableExists.rows[0].exists) {
      // Revoke all refresh tokens
      await pool.query(
        `UPDATE auth.refresh_tokens 
         SET is_revoked = TRUE, revoked_at = NOW()
         WHERE auth_user_id = $1 AND is_revoked = FALSE`,
        [userId],
      );
    }

    // Log admin action to moderation logs
    await pool.query(
      `INSERT INTO portal.moderation_logs
       (admin_user_id, action_type, target_type, target_id)
       VALUES ($1, 'force_logout', 'user', $2)`,
      [adminId, userId],
    );

    res.json({ message: "User logged out from all devices" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to force logout user" });
  }
};
