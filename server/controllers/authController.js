const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
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

exports.register = async (req, res) => {
  const {
    email,
    password,
    full_name,
    university,
    campus,
    program_id,
    semester,
    tu_registration_no,
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if email already exists
    const existing = await client.query(
      "SELECT 1 FROM auth.users WHERE email = $1",
      [email],
    );

    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Email already registered" });
    }

    // Validate strong password policy
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, and number.",
      });
    }

    // Hash password with stronger salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert into auth.users
    const authInsert = await client.query(
      `INSERT INTO auth.users (email, password_hash)
       VALUES ($1, $2)
       RETURNING auth_user_id`,
      [email, hashedPassword],
    );

    const authUserId = authInsert.rows[0].auth_user_id;

    // Insert into portal.users
    await client.query(
      `INSERT INTO portal.users
       (auth_user_id, full_name, university, campus, program_id, semester, tu_registration_no)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        authUserId,
        full_name,
        university,
        campus,
        program_id,
        semester,
        tu_registration_no,
      ],
    );

    // Generate email verification token
    const emailToken = jwt.sign(
      { auth_user_id: authUserId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    // Delete any existing tokens for this user (prevents multiple active tokens)
    await client.query(
      `DELETE FROM auth.email_verification_tokens
       WHERE auth_user_id = $1`,
      [authUserId],
    );

    // Save token in DB
    await client.query(
      `INSERT INTO auth.email_verification_tokens
       (auth_user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [authUserId, emailToken],
    );

    await client.query("COMMIT");

    // Send branded verification email
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${emailToken}`;

    try {
      await sendVerificationEmail({
        to: email,
        userName: full_name,
        verificationLink,
      });
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
      // Don't fail registration if email fails, user can request resend
    }

    res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  } finally {
    client.release();
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Single query to fetch all needed fields
    const result = await pool.query(
      `SELECT auth_user_id, password_hash, role, email_status
       FROM auth.users
       WHERE email = $1`,
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
      return res.status(400).json({ error: "Invalid credentials" });
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
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Note: We now allow unverified users to login but with limited access
    // The frontend will handle showing verification prompts

    // 🚫 Block suspended user
    const portalUser = await pool.query(
      `SELECT is_suspended, full_name FROM portal.users WHERE auth_user_id = $1`,
      [user.auth_user_id],
    );

    if (portalUser.rows[0]?.is_suspended) {
      await logAuthEvent(
        req,
        AuditActions.LOGIN_FAILED,
        { authUserId: user.auth_user_id, reason: "account_suspended" },
        AuditStatus.FAILURE,
      );
      return res.status(403).json({ error: "Your account is suspended." });
    }

    // ✅ Create tokens with refresh token rotation
    const tokens = await createTokens(user, req);

    // Log successful login
    await logAuthEvent(req, AuditActions.LOGIN_SUCCESS, {
      authUserId: user.auth_user_id,
    });

    // Update last_login timestamp
    await pool.query(
      `UPDATE auth.users SET last_login = NOW() WHERE auth_user_id = $1`,
      [user.auth_user_id],
    );

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Token missing" });
    }

    // Check token exists in DB
    const tokenCheck = await pool.query(
      `SELECT * FROM auth.email_verification_tokens
       WHERE token = $1`,
      [token],
    );

    if (tokenCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const tokenData = tokenCheck.rows[0];

    // Check expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return res.status(400).json({ error: "Token expired" });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update email status in auth.users
    await pool.query(
      `UPDATE auth.users
       SET email_status = 'verified'
       WHERE auth_user_id = $1`,
      [decoded.auth_user_id],
    );

    // ✅ Sync portal.users.is_verified
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
        await sendWelcomeEmail({
          to: email,
          userName: full_name,
        });
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
      }
    }

    res.json({ message: "Email successfully verified 🎉" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Verification failed" });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
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
      return res.status(404).json({ error: "User not found" });
    }

    const { email, email_status, full_name } = userResult.rows[0];

    // Check if already verified
    if (email_status === "verified") {
      return res.status(400).json({ error: "Email is already verified" });
    }

    // Delete any existing tokens for this user
    await pool.query(
      `DELETE FROM auth.email_verification_tokens WHERE auth_user_id = $1`,
      [auth_user_id],
    );

    // Generate new verification token
    const emailToken = jwt.sign({ auth_user_id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Save token in DB
    await pool.query(
      `INSERT INTO auth.email_verification_tokens
       (auth_user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
      [auth_user_id, emailToken],
    );

    // Send verification email
    const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${emailToken}`;

    await sendVerificationEmail({
      to: email,
      userName: full_name,
      verificationLink,
    });

    res.json({ message: "Verification email sent successfully" });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

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
       (auth_user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
      [authUserId, tokenHash],
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    // Get request info for security context
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    await sendPasswordResetEmail({
      to: email,
      userName: null, // Don't expose name in password reset for privacy
      resetLink,
      ipAddress,
      userAgent,
    });

    res.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validate strong password policy
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword)
    ) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, and number.",
      });
    }

    // Hash the incoming token and compare with stored hash
    const tokenHash = hashToken(token);

    const tokenResult = await pool.query(
      `SELECT * FROM auth.password_reset_tokens
       WHERE token_hash = $1
       AND expires_at > NOW()`,
      [tokenHash],
    );

    if (!tokenResult.rows.length) {
      return res.status(400).json({ error: "Invalid or expired token." });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reset failed." });
  }
};

/**
 * Refresh access token using refresh token (with rotation)
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

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
    console.error("Token refresh error:", err.message);

    if (err.message.includes("reuse detected")) {
      return res.status(401).json({
        error: "Security alert: Token reuse detected. Please log in again.",
        code: "TOKEN_REUSE",
      });
    }

    if (err.message.includes("expired")) {
      return res.status(401).json({
        error: "Refresh token expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

/**
 * Logout - revoke refresh token
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    // Log logout
    await logAuthEvent(req, AuditActions.LOGOUT);

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Logout failed" });
  }
};

/**
 * Logout from all devices
 */
exports.logoutAllDevices = async (req, res) => {
  try {
    const authUserId = req.user.auth_user_id;

    await revokeAllUserTokens(authUserId);

    // Log logout all
    await logAuthEvent(req, AuditActions.ALL_SESSIONS_REVOKED);

    res.json({ message: "Logged out from all devices successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to logout from all devices" });
  }
};

/**
 * Get user's active sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const authUserId = req.user.auth_user_id;

    const sessions = await getUserSessions(authUserId);

    res.json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

/**
 * Revoke a specific session
 */
exports.revokeSessionById = async (req, res) => {
  try {
    const authUserId = req.user.auth_user_id;
    const { id } = req.params;

    const revoked = await revokeSession(authUserId, id);

    if (!revoked) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Log session revocation
    await logAuthEvent(req, AuditActions.SESSION_REVOKED, { sessionId: id });

    res.json({ message: "Session revoked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to revoke session" });
  }
};
