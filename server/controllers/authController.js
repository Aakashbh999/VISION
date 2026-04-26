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
    return `${protocol}://${host}`.replace(/\/+$/, "");
  }

  return `http://localhost:${env.PORT || 5000}`;
};

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

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if email already exists
    const existing = await client.query(
      "SELECT 1 FROM auth.users WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      throw createError(400, "Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 1. Insert into auth.users phase
    const authInsert = await client.query(
      `INSERT INTO auth.users (email, password_hash)
       VALUES ($1, $2)
       RETURNING auth_user_id`,
      [email, hashedPassword],
    );

    const authUserId = authInsert.rows[0].auth_user_id;

    // 2. Normalize and compute academic data
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

    // Auto-calculate semester if not manual
    if (normalizedBatchYear && !normalizedManualSemester) {
      normalizedSemester = calculateSemesterFromBatch(normalizedBatchYear);
    }

    const academicCertificateUrl = req.file.path;

    // Check if registration exists in the pre-verified whitelist
    let studentStatus = "pending_review";
    if (tu_registration_no) {
      const whitelistHit = await client.query(
        `SELECT 1 FROM portal.registration_no 
         WHERE registration_number = $1 
         AND batch_year = $2 
         AND date_of_birth = $3`,
        [tu_registration_no, normalizedBatchYear, date_of_birth],
      );
      if (whitelistHit.rows.length > 0) {
        studentStatus = "approved";
      }
    }

    // 3. Insert into portal.users phase (atomic step)
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

    // 3.5 Populate Recommendation Engine (portal.user_interests)
    if (career_scope && typeof career_scope === "string") {
      const interests = career_scope
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (interests.length > 0) {
        // Find matching system tag IDs based on name
        const tagsRes = await client.query(
          `SELECT tag_id FROM portal.tags WHERE name = ANY($1)`,
          [interests],
        );

        // Insert into user_interests (which recommendation engine queries)
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

    // 4. Initialize User Stats (VisionXP)
    await client.query(
      `INSERT INTO portal.user_stats (user_id, total_xp, current_level)
       VALUES ($1, 0, 1)`,
      [portalUserId],
    );

    // 5. Verification token generation
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

    // 5. Post-commit: Notification / Verification Email
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

    // Specific handling for DB unique constraint violations
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

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.validatedBody || req.body;

  // Single query fetches auth + portal user data atomically
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
    // Log failed login attempt
    await logAuthEvent(
      req,
      AuditActions.LOGIN_FAILED,
      { email, reason: "user_not_found" },
      AuditStatus.FAILURE,
    );
    throw createError(400, "User does not exist");
  }

  const user = result.rows[0];

  // Check password
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

  // 🚫 Block suspended users
  if (user.is_suspended) {
    await logAuthEvent(
      req,
      AuditActions.LOGIN_FAILED,
      { authUserId: user.auth_user_id, reason: "account_suspended" },
      AuditStatus.FAILURE,
    );
    throw createError(403, "Your account is suspended.");
  }

  // ✅ Create tokens with refresh token rotation
  const tokens = await createTokens(user, req);

  // Log successful login and update last_login in parallel
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

exports.verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw createError(400, "Token missing");
  }

  // Check token exists in DB
  const tokenCheck = await pool.query(
    `SELECT * FROM auth.email_verification_tokens
       WHERE token = $1`,
    [token],
  );

  if (tokenCheck.rows.length === 0) {
    throw createError(400, "Invalid or expired token");
  }

  const tokenData = tokenCheck.rows[0];

  // Check expiration
  if (new Date(tokenData.expires_at) < new Date()) {
    throw createError(400, "Token expired");
  }

  // Verify JWT
  const decoded = jwt.verify(token, env.JWT_SECRET);

  // Update email status in auth.users
  await pool.query(
    `UPDATE auth.users
       SET email_status = 'verified'
       WHERE auth_user_id = $1`,
    [decoded.auth_user_id],
  );

  // \u2705 Sync portal.users.is_verified
  await pool.query(
    `UPDATE portal.users
       SET is_verified = true
       WHERE auth_user_id = $1`,
    [decoded.auth_user_id],
  );

  // Delete token (replay protection)
  await pool.query(
    `DELETE FROM auth.email_verification_tokens
       WHERE token = $1`,
    [token],
  );

  // Get user info to send welcome email
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

exports.resendVerificationEmail = catchAsync(async (req, res) => {
  const { auth_user_id } = req.user;

  // Get user info
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

  // Check if already verified
  if (email_status === "verified") {
    throw createError(400, "Email is already verified");
  }

  // Delete any existing tokens for this user
  await pool.query(
    `DELETE FROM auth.email_verification_tokens WHERE auth_user_id = $1`,
    [auth_user_id],
  );

  // Generate new verification token
  const emailToken = jwt.sign({ auth_user_id }, env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Save token in DB
  await pool.query(
    `INSERT INTO auth.email_verification_tokens
       (auth_user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
    [auth_user_id, emailToken],
  );

  // Send verification email with timeout
  const apiBaseUrl = resolveApiBaseUrl(req);
  const verificationLink = `${apiBaseUrl}/api/auth/verify-email?token=${emailToken}`;

  // Wrap with timeout promise to catch hanging Gmail SMTP
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

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.validatedBody || req.body;

  const userResult = await pool.query(
    "SELECT auth_user_id FROM auth.users WHERE email = $1",
    [email],
  );

  // Always respond the same (prevent email enumeration)
  if (!userResult.rows.length) {
    return res.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  }

  const authUserId = userResult.rows[0].auth_user_id;

  // Generate secure random token
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Hash the token for storage (raw token sent to user, hash stored in DB)
  const tokenHash = hashToken(rawToken);

  // Remove previous tokens for this user (only one active at a time)
  await pool.query(
    `DELETE FROM auth.password_reset_tokens
       WHERE auth_user_id = $1`,
    [authUserId],
  );

  // Store HASHED token in DB (never store raw token)
  await pool.query(
    `INSERT INTO auth.password_reset_tokens
       (auth_user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
    [authUserId, tokenHash],
  );

  const resetLink = `${env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;

  // Get request info for security context
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];

  try {
    const emailTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email sending timeout")), 15000),
    );

    await Promise.race([
      sendPasswordResetEmail({
        to: email,
        userName: null, // Don't expose name in password reset for privacy
        resetLink,
        ipAddress,
        userAgent,
      }),
      emailTimeout,
    ]);
  } catch (emailErr) {
    logger.warn({ err: emailErr }, "Password reset email timeout");
    // Still respond success to prevent user enumeration
  }

  res.json({
    message:
      "If an account with that email exists, a reset link has been sent.",
  });
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.validatedBody || req.body;

  // Hash the incoming token and compare with stored hash
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

  // Delete used token
  await pool.query(
    `DELETE FROM auth.password_reset_tokens
       WHERE auth_user_id = $1`,
    [auth_user_id],
  );

  res.json({ message: "Password successfully reset." });
});

exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.validatedBody || req.body;

  if (!refreshToken) {
    throw createError(400, "Refresh token required");
  }

  try {
    const tokens = await rotateRefreshToken(refreshToken, req);

    // Log token refresh
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

exports.logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.validatedBody || req.body;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  // Log logout
  await logAuthEvent(req, AuditActions.LOGOUT);

  res.json({ message: "Logged out successfully" });
});

exports.logoutAllDevices = catchAsync(async (req, res) => {
  const authUserId = req.user.auth_user_id;

  await revokeAllUserTokens(authUserId);

  // Log logout all
  await logAuthEvent(req, AuditActions.ALL_SESSIONS_REVOKED);

  res.json({ message: "Logged out from all devices successfully" });
});

exports.getSessions = catchAsync(async (req, res) => {
  const authUserId = req.user.auth_user_id;
  const sessions = await getUserSessions(authUserId);
  res.json(sessions);
});

exports.revokeSessionById = catchAsync(async (req, res) => {
  const authUserId = req.user.auth_user_id;
  const { id } = req.params;

  const revoked = await revokeSession(authUserId, id);

  if (!revoked) {
    throw createError(404, "Session not found");
  }

  // Log session revocation
  await logAuthEvent(req, AuditActions.SESSION_REVOKED, { sessionId: id });

  res.json({ message: "Session revoked successfully" });
});
