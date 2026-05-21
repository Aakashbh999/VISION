/**
 * Admin Controller
 * Handles administrative operations for student management, moderation, and system oversight.
 *
 * Features:
 * - Student registration review (approve/reject) with whitelist validation
 * - Student status management (active, suspended, rejected)
 * - Content moderation (discussions deletion, report management)
 * - User suspension and reactivation
 * - Admin audit logging for compliance tracking
 * - Pagination support for large datasets
 */

const pool = require("../config/db");
const {
  AuditActions,
  logAdminEvent,
  getAuditLogs,
  getAuditLogsCount,
} = require("../utils/auditService");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");
const logger = require("../utils/logger");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");
const { withTransaction } = require("../utils/withTransaction");
const {
  getModerationTargetConfig,
} = require("../utils/adminModerationTargets");

const logModerationAction = (adminId, actionType, targetType, targetId) =>
  pool.query(
    `INSERT INTO portal.moderation_logs
      (admin_user_id, action_type, target_type, target_id)
      VALUES ($1, $2, $3, $4)`,
    [adminId, actionType, targetType, targetId],
  );

const updateStudentStatus = async (
  userId,
  nextStatus,
  errorMessage,
  reason = null,
) => {
  const result = await pool.query(
    `UPDATE portal.users
      SET student_status = $2, rejection_reason = $3
      WHERE user_id = $1
      AND student_status != $2
      RETURNING user_id`,
    [userId, nextStatus, reason],
  );

  if (result.rowCount === 0) {
    throw createError(400, errorMessage);
  }
};

exports.getPendingStudents = catchAsync(async (req, res) => {
  const result = await pool.query(`
      SELECT
        p.user_id,
        p.full_name,
        a.email,
        pr.program_name,
        p.semester,
        p.tu_registration_no,
        p.student_status,
        p.created_at,
        p.date_of_birth,
        p.batch_year,
        p.academic_certificate_url,
        c.campus_name,
        EXISTS(
          SELECT 1 FROM portal.registration_no rn
          WHERE rn.registration_number = p.tu_registration_no
          AND rn.batch_year = p.batch_year
          AND rn.date_of_birth = p.date_of_birth
        ) AS is_whitelisted
      FROM portal.users p
      JOIN auth.users a ON p.auth_user_id = a.auth_user_id
      LEFT JOIN portal.programs pr ON p.program_id = pr.program_id
      LEFT JOIN portal.campuses c ON p.campus_id = c.campus_id
      WHERE p.student_status = 'pending_review'
      ORDER BY p.created_at ASC
    `);

  res.json({
    success: true,
    data: result.rows,
    pagination: {
      total: result.rowCount,
      page: 1,
      limit: result.rowCount,
      totalPages: 1,
    },
  });
});

exports.getStudentsByStatus = catchAsync(async (req, res) => {
  const { status, search } = req.query;
  const { page, limit, offset } = parsePagination(req.query, {
    defaultLimit: 10,
    maxLimit: 50,
  });

  const conditions = [];
  const values = [];

  if (status === "suspended") {
    conditions.push("p.is_suspended = TRUE");
  } else if (status) {
    conditions.push(
      `p.student_status = $${values.length + 1} AND p.is_suspended = FALSE`,
    );
    values.push(status);
  }

  if (search) {
    conditions.push(
      `(p.full_name ILIKE $${values.length + 1} OR p.tu_registration_no ILIKE $${values.length + 1})`,
    );
    values.push(`%${search}%`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const query = `
      SELECT
        p.user_id,
        p.full_name,
        a.email,
        pr.program_name,
        p.semester,
        p.tu_registration_no,
        p.student_status,
        p.is_suspended,
        p.created_at
      FROM portal.users p
      JOIN auth.users a ON p.auth_user_id = a.auth_user_id
      LEFT JOIN portal.programs pr ON p.program_id = pr.program_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

  const countQuery = `
      SELECT COUNT(*) FROM portal.users p
      ${whereClause}
    `;

  const [result, countResult] = await Promise.all([
    pool.query(query, [...values, limit, offset]),
    pool.query(countQuery, values),
  ]);

  const total = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: result.rows,
    pagination: buildPaginationMeta({ total, page, limit }),
  });
});

exports.approveStudent = catchAsync(async (req, res) => {
  const { user_id } = req.params;
  const adminId = req.user.portal_user_id;

  await updateStudentStatus(
    user_id,
    "approved",
    "Already approved or not found",
  );
  await logModerationAction(adminId, "approve", "user", user_id);

  res.json({ message: "Student approved successfully" });
});

exports.rejectStudent = catchAsync(async (req, res) => {
  const { user_id } = req.params;
  const { reason } = req.body;
  const adminId = req.user.portal_user_id;

  await updateStudentStatus(
    user_id,
    "rejected",
    "Already rejected or not found",
    reason,
  );
  await logModerationAction(adminId, "reject", "user", user_id);

  res.json({ message: "Student rejected successfully" });
});

exports.getStudentStats = catchAsync(async (req, res) => {
  const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE student_status = 'pending_review') AS pending,
        COUNT(*) FILTER (WHERE student_status = 'approved') AS approved,
        COUNT(*) FILTER (WHERE student_status = 'rejected') AS rejected,
        COUNT(*) FILTER (WHERE is_suspended = TRUE) AS suspended
      FROM portal.users
    `);

  res.json(result.rows[0]);
});

exports.deleteDiscussion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.portal_user_id;

  const result = await pool.query(
    `
      UPDATE portal.discussions
      SET deleted_at = NOW(), is_deleted = TRUE
      WHERE discussion_id = $1
      AND deleted_at IS NULL
      RETURNING discussion_id
      `,
    [id],
  );

  if (result.rowCount === 0) {
    throw createError(404, "Discussion not found or already deleted");
  }

  await pool.query(
    `
      INSERT INTO portal.moderation_logs
      (admin_user_id, action_type, target_type, target_id)
      VALUES ($1, 'delete', 'discussion', $2)
      `,
    [adminId, id],
  );

  res.json({ message: "Discussion deleted successfully" });
});

exports.getReports = catchAsync(async (req, res) => {
  const { search } = req.query;
  const { page, limit, offset } = parsePagination(req.query, {
    defaultLimit: 10,
    maxLimit: 50,
  });

  const conditions = ["r.status = 'open'"];
  const params = [];

  if (search) {
    conditions.push(
      `(r.reason ILIKE $${params.length + 1} OR r.target_type ILIKE $${params.length + 1} OR CAST(r.target_id AS TEXT) ILIKE $${params.length + 1})`,
    );
    params.push(`%${search}%`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const [reportsResult, totalResult] = await Promise.all([
    pool.query(
      `
        SELECT r.*, u.full_name as reporter_name
        FROM portal.reports r
        LEFT JOIN portal.users u ON r.reporter_user_id = u.user_id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `,
      [...params, limit, offset],
    ),
    pool.query(`SELECT COUNT(*) FROM portal.reports r ${whereClause}`, params),
  ]);

  const total = parseInt(totalResult.rows[0].count);

  res.json({
    success: true,
    data: reportsResult.rows,
    pagination: buildPaginationMeta({ total, page, limit }),
  });
});

exports.closeReport = catchAsync(async (req, res) => {
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
});

exports.suspendUser = catchAsync(async (req, res) => {
  const { user_id } = req.params;
  const adminId = req.user.portal_user_id;

  if (parseInt(user_id) === adminId) {
    return res.status(403).json({
      success: false,
      message:
        "Security Error: You cannot suspend your own administrative account.",
    });
  }

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
    throw createError(404, "User not found");
  }

  await logModerationAction(adminId, "suspend", "user", user_id);

  res.json({ message: "User suspended successfully" });
});

exports.reactivateUser = catchAsync(async (req, res) => {
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

  await logModerationAction(adminId, "reactivate", "user", user_id);

  res.json({ message: "User reactivated successfully" });
});

exports.getAdminDashboard = catchAsync(async (req, res) => {
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
});

exports.getModerationLogs = catchAsync(async (req, res) => {
  const { page, limit, offset } = parsePagination(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const [logsResult, countResult] = await Promise.all([
    pool.query(
      `SELECT ml.*, u.full_name as admin_name
         FROM portal.moderation_logs ml
         LEFT JOIN portal.users u ON ml.admin_user_id = u.user_id
         ORDER BY ml.created_at DESC
         LIMIT $1 OFFSET $2`,
      [limit, offset],
    ),
    pool.query(`SELECT COUNT(*) FROM portal.moderation_logs`),
  ]);

  const total = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: logsResult.rows,
    pagination: buildPaginationMeta({ total, page, limit }),
  });
});

exports.getAuditLogs = catchAsync(async (req, res) => {
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
});

exports.getAuditLogsSummary = catchAsync(async (req, res) => {
  const { days = 7 } = req.query;

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
});

exports.getUserActivity = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { limit = 20 } = req.query;

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
});

exports.getActiveSessions = catchAsync(async (req, res) => {
  const tableExists = await pool.query(
    `SELECT EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'auth'
         AND table_name = 'device_sessions'
       )`,
  );

  if (!tableExists.rows[0].exists) {
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
});

exports.forceLogoutUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const adminId = req.user.portal_user_id;

  const tableExists = await pool.query(
    `SELECT EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'auth'
         AND table_name = 'refresh_tokens'
       )`,
  );

  if (tableExists.rows[0].exists) {
    await pool.query(
      `UPDATE auth.refresh_tokens
         SET is_revoked = TRUE, revoked_at = NOW()
         WHERE auth_user_id = $1 AND is_revoked = FALSE`,
      [userId],
    );
  }

  await pool.query(
    `INSERT INTO portal.moderation_logs
       (admin_user_id, action_type, target_type, target_id)
       VALUES ($1, 'force_logout', 'user', $2)`,
    [adminId, userId],
  );

  res.json({ message: "User logged out from all devices" });
});

exports.hardDeleteContent = catchAsync(async (req, res) => {
  const { type, id } = req.body;
  const adminId = req.user.portal_user_id;

  if (!type || !id) {
    return res.status(400).json({ message: "Type and ID are required" });
  }

  const resultMessage = await withTransaction(async (client) => {
    let tableName;
    let idColumn;
    let cloudinaryIdColumn;

    switch (type) {
      case "discussion":
        tableName = "portal.discussions";
        idColumn = "discussion_id";
        cloudinaryIdColumn = "image_public_id";
        break;
      case "comment":
        tableName = "portal.discussion_comments";
        idColumn = "comment_id";
        break;
      case "resource":
        tableName = "portal.resources";
        idColumn = "resource_id";
        cloudinaryIdColumn = "cloudinary_public_id";
        break;
      case "group":
        tableName = "portal.study_groups";
        idColumn = "group_id";
        cloudinaryIdColumn = "group_image_public_id";
        break;
      default:
        throw createError(
          400,
          "Unsupported content type for permanent deletion",
        );
    }

    let publicIds = [];
    if (cloudinaryIdColumn) {
      const imgRes = await client.query(
        `SELECT ${cloudinaryIdColumn} ${type === "group" ? ", banner_image_public_id" : ""} FROM ${tableName} WHERE ${idColumn} = $1`,
        [id],
      );
      if (imgRes.rowCount > 0) {
        if (imgRes.rows[0][cloudinaryIdColumn])
          publicIds.push(imgRes.rows[0][cloudinaryIdColumn]);
        if (type === "group" && imgRes.rows[0].banner_image_public_id) {
          publicIds.push(imgRes.rows[0].banner_image_public_id);
        }
      }
    }

    const deleteRes = await client.query(
      `DELETE FROM ${tableName} WHERE ${idColumn} = $1 RETURNING ${idColumn}`,
      [id],
    );

    if (deleteRes.rowCount === 0) {
      throw createError(404, `${type} not found`);
    }

    for (const pid of publicIds) {
      try {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(pid);
      } catch (err) {
        logger.error(
          { err, pid },
          "Cloudinary cleanup failed for permanent delete",
        );
      }
    }

    await logAdminEvent(req, AuditActions.ADMIN_HARD_DELETE_CONTENT, type, id, {
      permanent: true,
    });

    return `${type} permanently deleted successfully`;
  }).catch((err) => {
    logger.error({ err }, "Hard delete content error");
    throw err;
  });

  res.json({ message: resultMessage });
});

exports.hardDeleteUser = catchAsync(async (req, res) => {
  const { user_id } = req.params;
  const adminId = req.user.portal_user_id;

  if (parseInt(user_id) === adminId) {
    return res.status(403).json({
      success: false,
      message:
        "Security Error: You cannot delete your own administrative account.",
    });
  }

  // Collect Cloudinary public IDs before the transaction so we can destroy
  // them after the DB commit (Cloudinary calls should not block the rollback path).
  let cloudinaryPublicIds = [];

  const message = await withTransaction(async (client) => {
    // ── 1. Verify the user exists ────────────────────────────────────────
    const userRes = await client.query(
      `SELECT auth_user_id FROM portal.users WHERE user_id = $1`,
      [user_id],
    );

    if (userRes.rowCount === 0) {
      throw createError(404, "User not found");
    }

    const authUserId = userRes.rows[0].auth_user_id;

    // ── 2. Fetch all resources uploaded by this user ─────────────────────
    const resourcesRes = await client.query(
      `SELECT resource_id, file_public_id
       FROM portal.resources
       WHERE created_by = $1`,
      [user_id],
    );

    const userResources = resourcesRes.rows;

    if (userResources.length > 0) {
      const resourceIds = userResources.map((r) => r.resource_id);
      // Collect cloud IDs for cleanup after commit
      cloudinaryPublicIds = userResources
        .map((r) => r.file_public_id)
        .filter(Boolean);

      const idArray = `{${resourceIds.join(",")}}`;

      // Delete all child-table rows for the user's resources
      await client.query(
        "DELETE FROM portal.resource_tags WHERE resource_id = ANY($1::int[])",
        [idArray],
      );
      await client.query(
        "DELETE FROM portal.step_resource_map WHERE resource_id = ANY($1::int[])",
        [idArray],
      );
      await client.query(
        "DELETE FROM portal.resource_scores WHERE resource_id = ANY($1::int[])",
        [idArray],
      );
      await client.query(
        "DELETE FROM portal.user_resource_interactions WHERE resource_id = ANY($1::int[])",
        [idArray],
      );

      // Delete the resource rows themselves
      await client.query(
        "DELETE FROM portal.resources WHERE resource_id = ANY($1::int[])",
        [idArray],
      );

      logger.info(
        { user_id, resourceCount: resourceIds.length },
        "Hard-deleted user resources before user removal",
      );
    }

    // ── 3. Delete the portal and auth user records ───────────────────────
    await client.query(`DELETE FROM portal.users WHERE user_id = $1`, [
      user_id,
    ]);

    await client.query(`DELETE FROM auth.users WHERE auth_user_id = $1`, [
      authUserId,
    ]);

    await logAdminEvent(
      req,
      AuditActions.ADMIN_HARD_DELETE_CONTENT,
      "user",
      user_id,
      {
        permanent: true,
        auth_user_id: authUserId,
        resources_deleted: userResources.length,
      },
    );

    return `User account permanently deleted along with ${userResources.length} uploaded resource(s)`;
  }).catch((err) => {
    logger.error({ err }, "Hard delete user error");
    throw err;
  });

  // ── 4. Destroy Cloudinary assets (best-effort, outside DB transaction) ──
  if (cloudinaryPublicIds.length > 0) {
    const cloudinary = require("../config/cloudinary");
    for (const publicId of cloudinaryPublicIds) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        logger.error(
          { err: cloudErr, publicId },
          "Cloudinary cleanup failed during user hard-delete",
        );
        // Non-fatal – DB records are already purged
      }
    }
    logger.info(
      { count: cloudinaryPublicIds.length },
      "Cloudinary assets destroyed after user hard-delete",
    );
  }

  res.json({ message });
});

exports.examineReportContent = catchAsync(async (req, res) => {
  const { report_id } = req.params;

  const reportRes = await pool.query(
    `SELECT * FROM portal.reports WHERE report_id = $1`,
    [report_id],
  );

  if (reportRes.rowCount === 0) {
    return res.status(404).json({ message: "Report not found" });
  }

  const report = reportRes.rows[0];
  let content = null;

  try {
    const config = getModerationTargetConfig(report.target_type);
    if (config?.examineQuery) {
      const result = await pool.query(config.examineQuery, [report.target_id]);
      content = result.rows[0];
    }
  } catch (err) {
    logger.error({ err }, "Examine report content error");
  }

  res.json({
    report,
    content: content || {
      message: "Content no longer available or unsupported type",
    },
  });
});

exports.resolveReportWithAction = catchAsync(async (req, res) => {
  const { report_id } = req.params;
  const { action } = req.body;
  const adminId = req.user.portal_user_id;

  if (!["dismiss", "soft_delete", "hard_delete"].includes(action)) {
    throw createError(400, "Invalid report action");
  }

  const message = await withTransaction(async (client) => {
    const reportRes = await client.query(
      `SELECT * FROM portal.reports WHERE report_id = $1`,
      [report_id],
    );

    if (reportRes.rowCount === 0) {
      throw createError(404, "Report not found");
    }

    const report = reportRes.rows[0];

    if (action === "soft_delete") {
      const config = getModerationTargetConfig(report.target_type);
      if (!config) {
        throw createError(
          400,
          `Unsupported target type: ${report.target_type}`,
        );
      }

      if (config.tableName) {
        const extraSet = config.softDeleteSetsDeletedFlag
          ? ", is_deleted = TRUE"
          : "";
        await client.query(
          `UPDATE ${config.tableName} SET deleted_at = NOW()${extraSet} WHERE ${config.idColumn} = $1`,
          [report.target_id],
        );
        await logAdminEvent(
          req,
          AuditActions.ADMIN_DELETE_CONTENT,
          report.target_type,
          report.target_id,
        );
      }
    } else if (action === "hard_delete") {
      const config = getModerationTargetConfig(report.target_type);
      if (!config) {
        throw createError(
          400,
          `Unsupported target type: ${report.target_type}`,
        );
      }

      if (config.tableName) {
        if (config.cloudinaryIdColumn) {
          const imgRes = await client.query(
            `SELECT ${config.cloudinaryIdColumn} ${report.target_type === "group" ? ", banner_image_public_id" : ""} FROM ${config.tableName} WHERE ${config.idColumn} = $1`,
            [report.target_id],
          );
          if (imgRes.rowCount > 0) {
            const cloudinary = require("../config/cloudinary");
            const row = imgRes.rows[0];
            if (row[config.cloudinaryIdColumn])
              await cloudinary.uploader
                .destroy(row[config.cloudinaryIdColumn])
                .catch((e) =>
                  logger.error({ err: e }, "Cloudinary cleanup error"),
                );
            if (report.target_type === "group" && row.banner_image_public_id) {
              await cloudinary.uploader
                .destroy(row.banner_image_public_id)
                .catch((e) =>
                  logger.error({ err: e }, "Cloudinary banner cleanup error"),
                );
            }
          }
        }

        await client.query(
          `DELETE FROM ${config.tableName} WHERE ${config.idColumn} = $1`,
          [report.target_id],
        );
        await logAdminEvent(
          req,
          AuditActions.ADMIN_HARD_DELETE_CONTENT,
          report.target_type,
          report.target_id,
        );
      }
    }

    const status = action === "dismiss" ? "dismissed" : "resolved";
    await client.query(
      `UPDATE portal.reports SET status = $1 WHERE report_id = $2`,
      [status, report_id],
    );

    await logAdminEvent(
      req,
      AuditActions.ADMIN_CLOSE_REPORT,
      "report",
      report_id,
      { action },
    );

    return `Report ${status} successfully with action: ${action}`;
  }).catch((err) => {
    logger.error({ err }, "Resolve report error");
    throw err;
  });

  res.json({ message });
});

exports.getRegistrationWhitelists = catchAsync(async (req, res) => {
  const { batch_year, program, search } = req.query;
  const { page, limit, offset } = parsePagination(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  let whereClause = "WHERE 1=1";
  const params = [];

  if (batch_year) {
    params.push(parseInt(batch_year));
    whereClause += ` AND batch_year = $${params.length}`;
  }

  if (program) {
    params.push(program);
    whereClause += ` AND program = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    whereClause += ` AND (student_name ILIKE $${params.length} OR registration_number ILIKE $${params.length})`;
  }

  const query = `
    SELECT * FROM portal.registration_no
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const countQuery = `SELECT COUNT(*) FROM portal.registration_no ${whereClause}`;

  const [result, countResult] = await Promise.all([
    pool.query(query, [...params, limit, offset]),
    pool.query(countQuery, params),
  ]);

  const total = parseInt(countResult.rows[0].count);

  res.json({
    success: true,
    data: result.rows,
    pagination: buildPaginationMeta({ total, page, limit }),
  });
});

exports.addRegistrationWhitelist = catchAsync(async (req, res) => {
  const {
    registration_number,
    student_name,
    date_of_birth,
    batch_year,
    program,
  } = req.body;

  const result = await pool.query(
    `INSERT INTO portal.registration_no
     (registration_number, student_name, date_of_birth, batch_year, program)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [registration_number, student_name, date_of_birth, batch_year, program],
  );

  await logAdminEvent(
    req,
    AuditActions.ADMIN_CREATE_CONTENT,
    "registration_whitelist",
    registration_number,
  );

  res.status(201).json({
    success: true,
    data: result.rows[0],
    message: "Registration added to whitelist",
  });
});

exports.updateRegistrationWhitelist = catchAsync(async (req, res) => {
  const { registration_number: originalRegNo } = req.params;
  const {
    registration_number,
    student_name,
    date_of_birth,
    batch_year,
    program,
  } = req.body;

  const result = await pool.query(
    `UPDATE portal.registration_no
     SET registration_number = $1, student_name = $2, date_of_birth = $3, batch_year = $4, program = $5
     WHERE registration_number = $6
     RETURNING *`,
    [
      registration_number,
      student_name,
      date_of_birth,
      batch_year,
      program,
      originalRegNo,
    ],
  );

  if (result.rowCount === 0) {
    throw createError(404, "Registration not found");
  }

  await logAdminEvent(
    req,
    AuditActions.ADMIN_UPDATE_CONTENT,
    "registration_whitelist",
    registration_number,
  );

  res.json({
    success: true,
    data: result.rows[0],
    message: "Registration updated",
  });
});

exports.deleteRegistrationWhitelist = catchAsync(async (req, res) => {
  const { registration_number } = req.params;

  const result = await pool.query(
    "DELETE FROM portal.registration_no WHERE registration_number = $1 RETURNING *",
    [registration_number],
  );

  if (result.rowCount === 0) {
    throw createError(404, "Registration not found");
  }

  await logAdminEvent(
    req,
    AuditActions.ADMIN_DELETE_CONTENT,
    "registration_whitelist",
    registration_number,
  );

  res.json({
    success: true,
    message: "Registration removed from whitelist",
  });
});
