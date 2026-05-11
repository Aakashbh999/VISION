

const pool = require("../config/db");
const logger = require("./logger");

const AuditActions = {

  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  LOGOUT: "logout",
  TOKEN_REFRESH: "token_refresh",
  PASSWORD_RESET_REQUEST: "password_reset_request",
  PASSWORD_RESET_SUCCESS: "password_reset_success",
  PASSWORD_CHANGE: "password_change",
  EMAIL_VERIFICATION: "email_verification",
  REGISTRATION: "registration",

  SESSION_CREATED: "session_created",
  SESSION_REVOKED: "session_revoked",
  ALL_SESSIONS_REVOKED: "all_sessions_revoked",
  NEW_DEVICE_LOGIN: "new_device_login",
  SUSPICIOUS_LOGIN: "suspicious_login",

  PROFILE_UPDATE: "profile_update",
  AVATAR_CHANGE: "avatar_change",
  SETTINGS_CHANGE: "settings_change",
  ACCOUNT_SUSPENDED: "account_suspended",
  ACCOUNT_REACTIVATED: "account_reactivated",

  DISCUSSION_CREATE: "discussion_create",
  DISCUSSION_DELETE: "discussion_delete",
  REPLY_CREATE: "reply_create",
  REPLY_DELETE: "reply_delete",
  POST_CREATE: "post_create",
  POST_DELETE: "post_delete",
  REPORT_SUBMIT: "report_submit",

  ADMIN_APPROVE_STUDENT: "approve",
  ADMIN_REJECT_STUDENT: "reject",
  ADMIN_SUSPEND_USER: "suspend",
  ADMIN_REACTIVATE_USER: "reactivate",
  ADMIN_DELETE_CONTENT: "delete",
  ADMIN_HARD_DELETE_CONTENT: "hard_delete",
  ADMIN_CLOSE_REPORT: "close_report",
};

const AuditStatus = {
  SUCCESS: "success",
  FAILURE: "failure",
  WARNING: "warning",
};

const logModerationAction = async ({
  adminUserId,
  actionType,
  targetType,
  targetId,
}) => {
  try {
    await pool.query(
      `INSERT INTO portal.moderation_logs
       (admin_user_id, action_type, target_type, target_id)
       VALUES ($1, $2, $3, $4)`,
      [adminUserId, actionType, targetType, targetId],
    );
  } catch (err) {
    logger.error({ err }, "Moderation log error");
  }
};

const getRequestInfo = (req) => {
  return {
    ipAddress:
      req.ip || req.connection?.remoteAddress || req.headers["x-forwarded-for"],
    userAgent: req.headers["user-agent"],
    authUserId: req.user?.auth_user_id || null,
    portalUserId: req.user?.portal_user_id || null,
  };
};

const logAuthEvent = async (
  req,
  action,
  details = {},
  status = AuditStatus.SUCCESS,
) => {
  const requestInfo = getRequestInfo(req);

  logger.info({
    action,
    authUserId: requestInfo.authUserId || details.authUserId,
    ip: requestInfo.ipAddress,
    status,
    ...details,
  });

};

const logContentEvent = async (
  req,
  action,
  resourceType,
  resourceId,
  details = {},
) => {
  const requestInfo = getRequestInfo(req);

  logger.info({
    action,
    userId: requestInfo.portalUserId,
    resourceType,
    resourceId,
    ip: requestInfo.ipAddress,
    ...details,
  });
};

const logAdminEvent = async (
  req,
  action,
  resourceType,
  resourceId,
  details = {},
) => {
  const requestInfo = getRequestInfo(req);

  await logModerationAction({
    adminUserId: requestInfo.portalUserId,
    actionType: action,
    targetType: resourceType,
    targetId:
      typeof resourceId === "number"
        ? resourceId
        : parseInt(resourceId, 10) || null,
  });
};

const getAuditLogs = async ({
  adminUserId = null,
  actionType = null,
  targetType = null,
  limit = 50,
  offset = 0,
} = {}) => {
  let query = `
    SELECT
      ml.log_id,
      ml.admin_user_id,
      pu.full_name as admin_name,
      ml.action_type,
      ml.target_type,
      ml.target_id,
      ml.created_at
    FROM portal.moderation_logs ml
    LEFT JOIN portal.users pu ON ml.admin_user_id = pu.user_id
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (adminUserId) {
    query += ` AND ml.admin_user_id = $${paramIndex++}`;
    params.push(adminUserId);
  }

  if (actionType) {
    query += ` AND ml.action_type = $${paramIndex++}`;
    params.push(actionType);
  }

  if (targetType) {
    query += ` AND ml.target_type = $${paramIndex++}`;
    params.push(targetType);
  }

  query += ` ORDER BY ml.created_at DESC`;
  query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
};

const getAuditLogsCount = async ({
  adminUserId = null,
  actionType = null,
  targetType = null,
} = {}) => {
  let query = `SELECT COUNT(*) FROM portal.moderation_logs ml WHERE 1=1`;

  const params = [];
  let paramIndex = 1;

  if (adminUserId) {
    query += ` AND ml.admin_user_id = $${paramIndex++}`;
    params.push(adminUserId);
  }

  if (actionType) {
    query += ` AND ml.action_type = $${paramIndex++}`;
    params.push(actionType);
  }

  if (targetType) {
    query += ` AND ml.target_type = $${paramIndex++}`;
    params.push(targetType);
  }

  const result = await pool.query(query, params);
  return parseInt(result.rows[0].count, 10);
};

module.exports = {
  AuditActions,
  AuditStatus,
  logModerationAction,
  logAuthEvent,
  logContentEvent,
  logAdminEvent,
  getAuditLogs,
  getAuditLogsCount,
  getRequestInfo,
};
