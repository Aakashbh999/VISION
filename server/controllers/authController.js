/**
 * Authentication Controller
 * Handles user registration, login, email verification, password reset, and JWT token management.
 * Implements OAuth-style JWT token rotation, multi-device session tracking, and security features.
 *
 * Features:
 * - User registration with academic certificate verification and email validation
 * - Login with suspension and email verification checks
 * - JWT access/refresh token management with rotation and reuse detection
 * - Email-based password reset flow with one-time tokens
 * - Multi-device session management with revocation capabilities
 * - Comprehensive audit logging for all authentication actions
 */

const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const createError = require("http-errors");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require("../utils/emailService");
const {
  createTokens,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getUserSessions,
  revokeSession,
  hashToken,
} = require("../utils/sessionService");
const {
  AuditActions,
  AuditStatus,
  logAuthEvent,
} = require("../utils/auditService");
const { calculateSemesterFromBatch } = require("../utils/academicUtils");
const catchAsync = require("../utils/catchAsync");
const env = require("../config/env");
const logger = require("../utils/logger");

/**
 * Resolves the API base URL for email verification links
 * Prefers configured BASE_URL, falls back to request headers (for proxied environments), then defaults to localhost
 * @param {Object} req - Express request object
 * @returns {string} - Base URL for verification links
 */
const resolveApiBaseUrl = (req) => {
  const configuredBaseUrl = (env.BASE_URL || "").trim();
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  const forwardedProto = req.get("x-forwarded-proto");
  const protocol = forwardedProto
    ? forwardedProto.split(",")[0].trim()
    : req.protocol;
  const host = req.get("x-forwarded-host") || req.get("host");

  if (host) {
    return `${protocol}://${host}`;
  }

  return `http://localhost:${env.PORT || 5000}`;
};

/**
 * User Registration Handler
 * Creates new student account with email verification workflow
 * - Validates academic certificate upload
 * - Creates separate auth (security) and portal (business) user records
 * - Calculates semester from batch year if not manually specified
 * - Associates user interests/career scope with system tags
 * - Initializes user statistics (XP, level)
 * - Sends verification email asynchronously (non-blocking)
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.file - Academic certificate file
 * @param {Object} req.validatedBody - Validated request body containing:
 *   - email {string} - User email (unique)
 *   - password {string} - Hashed with bcrypt (12 rounds)
 *   - full_name {string}
 *   - university {string}
 *   - campus_id {number}
 *   - program_id {number}
 *   - semester {number} - Academic semester (optional, calculated from batch_year)
 *   - batch_year {number} - Student batch year (optional)
 *   - semester_is_manual {boolean} - Whether semester was manually entered
 *   - tu_registration_no {string} - Unique registration number
 *   - career_scope {string} - Comma-separated interests
 *   - date_of_birth {string} - ISO date
 * @param {Object} res - Express response object
 * @returns {void} - Returns 201 with auth_user_id and success message
 * @throws {Error} - 400 if email/registration number already exists, 400 if certificate missing
 */
exports.register = catchAsync(async (req, res) => {
  const input = req.validatedBody || req.body;
  const {
    email,
    password,
    full_name,
    university,
    campus_id,
    program_id,
    semester,
    batch_year,
    semester_is_manual,
    tu_registration_no,
    career_scope,
    date_of_birth,
  } = input;

  const normalizedFullName = full_name;

  if (!req.file) {
    throw createError(400, "Academic Certificate is required.");
  }

  // Transaction-based approach to ensure atomic account creation
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check for duplicate email
    const existing = await client.query(
      "SELECT 1 FROM auth.users WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      throw createError(400, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const authInsert = await client.query(
      `INSERT INTO auth.users (email, password_hash)
       VALUES ($1, $2)
       RETURNING auth_user_id`,
      [email, hashedPassword],
    );

    const authUserId = authInsert.rows[0].auth_user_id;

    const normalizedBatchYear =
      batch_year === undefined || batch_year === null || batch_year === ""
        ? null
        : Number.parseInt(batch_year, 10);

    const normalizedManualSemester =
      semester_is_manual === true || semester_is_manual === "true";

    let normalizedSemester =
      semester === undefined || semester === null || semester === ""
        ? null
        : Number.parseInt(semester, 10);

    if (normalizedBatchYear && !normalizedManualSemester) {
      normalizedSemester = calculateSemesterFromBatch(normalizedBatchYear);
    }

    const academicCertificateUrl = req.file.path;

    const studentStatus = "pending_review";

    const portalInsert = await client.query(
      `INSERT INTO portal.users
       (auth_user_id, full_name, university, campus_id, program_id, semester, batch_year,
        semester_is_manual, tu_registration_no, academic_certificate_url, career_scope, date_of_birth, student_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING user_id`,
      [
        authUserId,
        normalizedFullName,
        university || "TU",
        campus_id ? parseInt(campus_id, 10) : null,
        program_id ? parseInt(program_id, 10) : null,
        normalizedSemester,
        normalizedBatchYear,
        normalizedManualSemester,
        tu_registration_no,
        academicCertificateUrl,
        career_scope,
        date_of_birth,
        studentStatus,
      ],
    );

    const portalUserId = portalInsert.rows[0].user_id;

    if (career_scope && typeof career_scope === "string") {
      const interests = career_scope
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (interests.length > 0) {
        const tagsRes = await client.query(
          `SELECT tag_id FROM portal.tags WHERE name = ANY($1)`,
          [interests],
        );

        if (tagsRes.rows.length > 0) {
          const insertVals = tagsRes.rows
            .map((r) => `(${portalUserId}, ${r.tag_id})`)
            .join(", ");
          await client.query(`
            INSERT INTO portal.user_interests (user_id, tag_id)
            VALUES ${insertVals}
            ON CONFLICT DO NOTHING
          `);
        }
      }
    }

    await client.query(
      `INSERT INTO portal.user_stats (user_id, total_xp, current_level)
       VALUES ($1, 0, 1)`,
      [portalUserId],
    );

    const emailToken = jwt.sign({ auth_user_id: authUserId }, env.JWT_SECRET, {
      expiresIn: "24h",
    });

    await client.query(
      `DELETE FROM auth.email_verification_tokens
       WHERE auth_user_id = $1`,
      [authUserId],
    );

    await client.query(
      `INSERT INTO auth.email_verification_tokens
       (auth_user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [authUserId, emailToken],
    );

    await client.query("COMMIT");

    const apiBaseUrl = resolveApiBaseUrl(req);
    const verificationLink = `${apiBaseUrl}/api/auth/verify-email?token=${emailToken}`;

    try {
      const emailTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email sending timeout")), 15000),
      );

      await Promise.race([
        sendVerificationEmail({
          to: email,
          userName: normalizedFullName,
          verificationLink,
        }),
        emailTimeout,
      ]);
    } catch (emailErr) {
      logger.warn({ err: emailErr }, "Non-blocking verification email failure");
    }

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      auth_user_id: authUserId,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    if (err.code === "23505") {
      if (err.detail.includes("tu_registration_no")) {
        err.message = "Registration Number already in use.";
        err.statusCode = 400;
      } else if (err.detail.includes("email")) {
        err.message = "Email already registered.";
        err.statusCode = 400;
      }
    }
    throw err;
  } finally {
    client.release();
  }
});

/**
 * User Login Handler
 * Validates credentials and issues JWT access/refresh token pair
 * - Verifies email exists in system
 * - Performs password comparison (bcrypt)
 * - Checks if account is suspended
 * - Logs authentication event to audit trail
 * - Updates last_login timestamp
 * - Returns JWT tokens with 15-minute expiry and 7-day refresh rotation
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.validatedBody - { email: string, password: string }
 * @param {Object} res - Express response object
 * @returns {Object} - { accessToken, refreshToken, expiresIn, role }
 * @throws {Error} - 400 if user not found or invalid credentials, 403 if suspended
 */
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.validatedBody || req.body;

  const result = await pool.query(
    `SELECT
         a.auth_user_id,
         a.password_hash,
         a.role,
         a.email_status,
         p.is_suspended,
         p.full_name
       FROM auth.users a
       JOIN portal.users p ON p.auth_user_id = a.auth_user_id
       WHERE a.email = $1`,
    [email],
  );

  if (result.rows.length === 0) {
    await logAuthEvent(
      req,
      AuditActions.LOGIN_FAILED,
      { email, reason: "user_not_found" },
      AuditStatus.FAILURE,
    );
    throw createError(400, "User does not exist");
  }

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    await logAuthEvent(
      req,
      AuditActions.LOGIN_FAILED,
      { email, authUserId: user.auth_user_id, reason: "invalid_password" },
      AuditStatus.FAILURE,
    );
    throw createError(400, "Invalid credentials");
  }

  if (user.is_suspended) {
    await logAuthEvent(
      req,
      AuditActions.LOGIN_FAILED,
      { authUserId: user.auth_user_id, reason: "account_suspended" },
      AuditStatus.FAILURE,
    );
    throw createError(403, "Your account is suspended.");
  }

  const tokens = await createTokens(user, req);

  await Promise.all([
    logAuthEvent(req, AuditActions.LOGIN_SUCCESS, {
      authUserId: user.auth_user_id,
    }),
    pool.query(
      `UPDATE auth.users SET last_login = NOW() WHERE auth_user_id = $1`,
      [user.auth_user_id],
    ),
  ]);

  res.json({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
    role: user.role,
  });
});

/**
 * Email Verification Handler
 * Validates one-time email verification token and activates user account
 * - Checks token existence and expiration (24h window)
 * - Decodes JWT to extract auth_user_id
 * - Updates email_status to 'verified' in auth.users
 * - Sets is_verified flag in portal.users
 * - Sends welcome email asynchronously
 * - Deletes token after use (one-time use)
 *
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.query.token - Signed JWT email verification token
 * @param {Object} res - Express response object
 * @returns {Object} - { message: "Email successfully verified" }
 * @throws {Error} - 400 if token missing, invalid, or expired
 */
exports.verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw createError(400, "Token missing");
  }

  const tokenCheck = await pool.query(
    `SELECT * FROM auth.email_verification_tokens
       WHERE token = $1`,
    [token],
  );

  if (tokenCheck.rows.length === 0) {
    throw createError(400, "Invalid or expired token");
  }

  const tokenData = tokenCheck.rows[0];

  if (new Date(tokenData.expires_at) < new Date()) {
    throw createError(400, "Token expired");
  }

  const decoded = jwt.verify(token, env.JWT_SECRET);

  await pool.query(
    `UPDATE auth.users
       SET email_status = 'verified'
       WHERE auth_user_id = $1`,
    [decoded.auth_user_id],
  );

  await pool.query(
    `UPDATE portal.users
       SET is_verified = true
       WHERE auth_user_id = $1`,
    [decoded.auth_user_id],
  );

  await pool.query(
    `DELETE FROM auth.email_verification_tokens
       WHERE token = $1`,
    [token],
  );

  const userInfo = await pool.query(
    `SELECT a.email, p.full_name
       FROM auth.users a
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       WHERE a.auth_user_id = $1`,
    [decoded.auth_user_id],
  );

  if (userInfo.rows.length > 0) {
    const { email, full_name } = userInfo.rows[0];
    try {
      const emailTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email sending timeout")), 15000),
      );

      await Promise.race([
        sendWelcomeEmail({
          to: email,
          userName: full_name,
        }),
        emailTimeout,
      ]);
    } catch (emailErr) {
      logger.warn({ err: emailErr }, "Failed to send welcome email");
    }
  }

  res.json({ message: "Email successfully verified" });
});

/**
 * Resend Verification Email Handler
 * Generates new verification token and sends email to unverified users
 * - Checks if user exists and account is not already verified
 * - Invalidates previous tokens
 * - Creates new 24h JWT token
 * - Sends email with verification link (non-blocking)
 *
 * @async
 * @param {Object} req - Express request object (requires auth)
 * @param {Object} req.user - { auth_user_id }
 * @param {Object} res - Express response object
 * @returns {Object} - { message: "Verification email sent successfully" }
 * @throws {Error} - 400 if already verified, 404 if user not found
 */
exports.resendVerificationEmail = catchAsync(async (req, res) => {
  const { auth_user_id } = req.user;

  const userResult = await pool.query(
    `SELECT a.email, a.email_status, p.full_name
       FROM auth.users a
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       WHERE a.auth_user_id = $1`,
    [auth_user_id],
  );

  if (!userResult.rows.length) {
    throw createError(404, "User not found");
  }

  const { email, email_status, full_name } = userResult.rows[0];

  if (email_status === "verified") {
    throw createError(400, "Email is already verified");
  }

  await pool.query(
    `DELETE FROM auth.email_verification_tokens WHERE auth_user_id = $1`,
    [auth_user_id],
  );

  const emailToken = jwt.sign({ auth_user_id }, env.JWT_SECRET, {
    expiresIn: "24h",
  });

  await pool.query(
    `INSERT INTO auth.email_verification_tokens
       (auth_user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
    [auth_user_id, emailToken],
  );

  const apiBaseUrl = resolveApiBaseUrl(req);
  const verificationLink = `${apiBaseUrl}/api/auth/verify-email?token=${emailToken}`;

  const emailTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Email sending timeout")), 15000),
  );

  await Promise.race([
    sendVerificationEmail({
      to: email,
      userName: full_name,
      verificationLink,
    }),
    emailTimeout,
  ]);

  res.json({ message: "Verification email sent successfully" });
});

/**
 * Forgot Password Handler
 * Initiates password reset flow via email
 * - Checks if email exists (does not reveal email status for security)
 * - Generates cryptographically secure random token (32 bytes hex)
 * - Hashes token for database storage
 * - Creates 1-hour expiring reset token
 * - Sends password reset email with raw token in link
 * - Non-blocking email send (logs timeout warnings)
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.validatedBody - { email: string }
 * @param {Object} res - Express response object
 * @returns {Object} - Generic message (same for existing/non-existing emails for security)
 * @throws {Error} - None (always returns success message)
 */
exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.validatedBody || req.body;

  const userResult = await pool.query(
    "SELECT auth_user_id FROM auth.users WHERE email = $1",
    [email],
  );

  if (!userResult.rows.length) {
    return res.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  }

  const authUserId = userResult.rows[0].auth_user_id;

  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = hashToken(rawToken);

  await pool.query(
    `DELETE FROM auth.password_reset_tokens
       WHERE auth_user_id = $1`,
    [authUserId],
  );

  await pool.query(
    `INSERT INTO auth.password_reset_tokens
       (auth_user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
    [authUserId, tokenHash],
  );

  const resetLink = `${env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;

  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];

  try {
    const emailTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email sending timeout")), 15000),
    );

    await Promise.race([
      sendPasswordResetEmail({
        to: email,
        userName: null,
        resetLink,
        ipAddress,
        userAgent,
      }),
      emailTimeout,
    ]);
  } catch (emailErr) {
    logger.warn({ err: emailErr }, "Password reset email timeout");
  }

  res.json({
    message:
      "If an account with that email exists, a reset link has been sent.",
  });
});

/**
 * Reset Password Handler
 * Completes password reset using one-time token from email
 * - Validates token and checks expiration (1 hour window)
 * - Hashes new password with bcrypt (12 rounds)
 * - Updates auth.users password_hash
 * - Invalidates all existing refresh tokens (forces re-login)
 * - Deletes reset token (one-time use)
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.validatedBody - { token: string, newPassword: string }
 * @param {Object} res - Express response object
 * @returns {Object} - { message: "Password successfully reset." }
 * @throws {Error} - 400 if token invalid or expired
 */
exports.resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.validatedBody || req.body;

  const tokenHash = hashToken(token);

  const tokenResult = await pool.query(
    `SELECT * FROM auth.password_reset_tokens
       WHERE token = $1
       AND expires_at > NOW()`,
    [tokenHash],
  );

  if (!tokenResult.rows.length) {
    throw createError(400, "Invalid or expired token.");
  }

  const { auth_user_id } = tokenResult.rows[0];

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await pool.query(
    `UPDATE auth.users
       SET password_hash = $1
       WHERE auth_user_id = $2`,
    [hashedPassword, auth_user_id],
  );

  await pool.query(
    `DELETE FROM auth.password_reset_tokens
       WHERE auth_user_id = $1`,
    [auth_user_id],
  );

  res.json({ message: "Password successfully reset." });
});

/**
 * JWT Token Refresh Handler
 * Rotates refresh token and issues new access/refresh pair
 * - Validates refresh token and checks for reuse (security measure)
 * - Generates new token pair with rotated refresh token
 * - Logs token refresh event
 * - Detects refresh token reuse and requires full re-login for security
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.validatedBody - { refreshToken: string }
 * @param {Object} res - Express response object
 * @returns {Object} - { accessToken, refreshToken, expiresIn, role }
 * @throws {Error} - 401 if token expired, reused, or invalid
 */
exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.validatedBody || req.body;

  if (!refreshToken) {
    throw createError(400, "Refresh token required");
  }

  try {
    const tokens = await rotateRefreshToken(refreshToken, req);

    await logAuthEvent(req, AuditActions.TOKEN_REFRESH, {
      authUserId: tokens.authUserId,
    });

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      role: tokens.role,
    });
  } catch (err) {
    const errorMessage = err?.message || "";
    if (errorMessage.includes("reuse detected")) {
      throw createError(
        401,
        "Security alert: Token reuse detected. Please log in again.",
      );
    } else if (errorMessage.includes("expired")) {
      throw createError(401, "Refresh token expired. Please log in again.");
    } else {
      throw createError(401, "Invalid refresh token");
    }
  }
});

/**
 * Logout Handler (Single Device)
 * Revokes refresh token for current device
 * - Invalidates single session token
 * - Logs logout event
 *
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.validatedBody - { refreshToken: string }
 * @param {Object} res - Express response object
 * @returns {Object} - { message: "Logged out successfully" }
 */
exports.logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.validatedBody || req.body;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  await logAuthEvent(req, AuditActions.LOGOUT);

  res.json({ message: "Logged out successfully" });
});

/**
 * Logout Handler (All Devices)
 * Revokes all refresh tokens for user across all devices/sessions
 * - Invalidates all active refresh tokens
 * - Logs all-sessions-revoked event
 * - Requires full re-login on all devices
 *
 * @async
 * @param {Object} req - Express request object (requires auth)
 * @param {Object} req.user - { auth_user_id }
 * @param {Object} res - Express response object
 * @returns {Object} - { message: "Logged out from all devices successfully" }
 */
exports.logoutAllDevices = catchAsync(async (req, res) => {
  const authUserId = req.user.auth_user_id;

  await revokeAllUserTokens(authUserId);

  await logAuthEvent(req, AuditActions.ALL_SESSIONS_REVOKED);

  res.json({ message: "Logged out from all devices successfully" });
});

/**
 * Get Active Sessions Handler
 * Returns list of all active sessions for current user
 * - Lists device info, last activity, and session metadata
 * - Useful for multi-device session management UI
 *
 * @async
 * @param {Object} req - Express request object (requires auth)
 * @param {Object} req.user - { auth_user_id }
 * @param {Object} res - Express response object
 * @returns {Array} - List of active session objects
 */
exports.getSessions = catchAsync(async (req, res) => {
  const authUserId = req.user.auth_user_id;
  const sessions = await getUserSessions(authUserId);
  res.json(sessions);
});

/**
 * Revoke Specific Session Handler
 * Invalidates a single session by ID (allows logout from specific device)
 * - Validates session belongs to current user
 * - Revokes specified session token
 * - Logs session revocation
 *
 * @async
 * @param {Object} req - Express request object (requires auth)
 * @param {Object} req.user - { auth_user_id }
 * @param {string} req.params.id - Session ID to revoke
 * @param {Object} res - Express response object
 * @returns {Object} - { message: "Session revoked successfully" }
 * @throws {Error} - 404 if session not found
 */
exports.revokeSessionById = catchAsync(async (req, res) => {
  const authUserId = req.user.auth_user_id;
  const { id } = req.params;

  const revoked = await revokeSession(authUserId, id);

  if (!revoked) {
    throw createError(404, "Session not found");
  }

  await logAuthEvent(req, AuditActions.SESSION_REVOKED, { sessionId: id });

  res.json({ message: "Session revoked successfully" });
});
