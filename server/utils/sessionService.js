/**
 * Session Service
 * Handles JWT token management with DB-backed refresh token storage
 *
 * SECURITY FEATURES:
 * - Refresh tokens are stored as SHA256 hashes (raw token never stored)
 * - Token rotation with reuse detection
 * - Proper revocation support
 * - Device tracking
 */

const pool = require("../config/db");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { UAParser } = require("ua-parser-js");
const logger = require("./logger");
const env = require("../config/env");

// Token expiry times
const ACCESS_TOKEN_EXPIRY = "15m"; // Short-lived access token
const REFRESH_TOKEN_EXPIRY_DAYS = 7; // Refresh token valid for 7 days
const REFRESH_TOKEN_EXPIRY = `${REFRESH_TOKEN_EXPIRY_DAYS}d`;

/**
 * Hash a token using SHA256 (for secure storage)
 */
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Parse user agent to extract device info
 */
const parseUserAgent = (userAgent) => {
  if (!userAgent) {
    return { deviceType: "unknown", browser: "Unknown", os: "Unknown" };
  }

  const parsed = new UAParser(userAgent).getResult();
  const deviceType = parsed.device.type || "desktop";
  const browser = parsed.browser.name || "Unknown";
  const os = parsed.os.name || "Unknown";

  return { deviceType, browser, os };
};

/**
 * Generate device ID from request fingerprint
 */
const generateDeviceId = (req) => {
  const userAgent = req.headers["user-agent"] || "";
  const acceptLanguage = req.headers["accept-language"] || "";
  const fingerprint = `${userAgent}-${acceptLanguage}`;
  return crypto
    .createHash("md5")
    .update(fingerprint)
    .digest("hex")
    .substring(0, 16);
};

/**
 * Create tokens (access + refresh) - DB-backed approach with hashing
 */
const createTokens = async (user, req) => {
  const deviceId = generateDeviceId(req);
  const deviceInfo = parseUserAgent(req.headers["user-agent"]);
  const ipAddress =
    req.ip || req.connection?.remoteAddress || req.headers["x-forwarded-for"];
  const userAgent = req.headers["user-agent"] || "";

  // Generate access token (short-lived JWT)
  const accessToken = jwt.sign(
    {
      auth_user_id: user.auth_user_id,
      role: user.role,
      type: "access",
    },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );

  // Generate secure random refresh token (NOT a JWT - just random bytes)
  const rawRefreshToken = crypto.randomBytes(64).toString("hex");
  const tokenHash = hashToken(rawRefreshToken);

  // Calculate expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

  // Store hashed refresh token in DB
  try {
    await pool.query(
      `INSERT INTO auth.refresh_tokens 
       (auth_user_id, token_hash, device_id, device_info, ip_address, user_agent, expires_at, last_used_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        user.auth_user_id,
        tokenHash,
        deviceId,
        JSON.stringify(deviceInfo),
        ipAddress,
        userAgent,
        expiresAt,
      ],
    );
  } catch (err) {
    // If table doesn't exist yet, fall back to JWT-only (for migration compatibility)
    if (err.code === "42P01") {
      logger.warn("auth.refresh_tokens table not found, using JWT-only mode");
      const jwtRefreshToken = jwt.sign(
        {
          auth_user_id: user.auth_user_id,
          role: user.role,
          type: "refresh",
          deviceId,
        },
        env.JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY },
      );
      return { accessToken, refreshToken: jwtRefreshToken, expiresIn: 15 * 60 };
    }
    throw err;
  }

  // Return raw token to client (will be hashed for comparison later)
  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
};

/**
 * Rotate refresh token - validates old token and issues new pair
 * Implements token rotation with reuse detection
 */
const rotateRefreshToken = async (refreshToken, req) => {
  const tokenHash = hashToken(refreshToken);

  try {
    // Look up the hashed token in DB
    const tokenResult = await pool.query(
      `SELECT rt.*, a.role, a.email_status, p.is_suspended
       FROM auth.refresh_tokens rt
       JOIN auth.users a ON rt.auth_user_id = a.auth_user_id
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       WHERE rt.token_hash = $1`,
      [tokenHash],
    );

    if (!tokenResult.rows.length) {
      // Token not found - could be JWT fallback mode or invalid
      return await rotateRefreshTokenJWT(refreshToken, req);
    }

    const token = tokenResult.rows[0];

    // Check if token was revoked (REUSE DETECTION)
    if (token.revoked) {
      // Security breach! Someone is trying to reuse an old token
      // Revoke ALL tokens for this user as a precaution
      await pool.query(
        `UPDATE auth.refresh_tokens 
         SET revoked = true, revoked_at = NOW() 
         WHERE auth_user_id = $1`,
        [token.auth_user_id],
      );
      throw createError(401, "Token reuse detected - all sessions revoked");
    }

    // Check expiration
    if (new Date(token.expires_at) < new Date()) {
      throw createError(401, "Refresh token expired");
    }

    // Check user status
    if (token.is_suspended) {
      throw createError(403, "Account suspended");
    }

    if (token.email_status !== "verified") {
      throw createError(403, "Email not verified");
    }

    // ROTATE: Mark old token as revoked
    await pool.query(
      `UPDATE auth.refresh_tokens 
       SET revoked = true, revoked_at = NOW() 
       WHERE token_hash = $1`,
      [tokenHash],
    );

    // Generate new token pair
    const user = { auth_user_id: token.auth_user_id, role: token.role };
    const tokens = await createTokens(user, req);

    return {
      ...tokens,
      authUserId: token.auth_user_id,
      role: token.role,
    };
  } catch (err) {
    // If table doesn't exist, fall back to JWT-only
    if (err.code === "42P01") {
      return await rotateRefreshTokenJWT(refreshToken, req);
    }
    throw err;
  }
};

/**
 * Fallback: JWT-only rotation (for backwards compatibility)
 */
const rotateRefreshTokenJWT = async (refreshToken, req) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_SECRET);

    if (decoded.type !== "refresh") {
      throw createError(401, "Invalid token type");
    }

    const userResult = await pool.query(
      `SELECT a.auth_user_id, a.role, a.email_status, p.is_suspended
       FROM auth.users a
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       WHERE a.auth_user_id = $1`,
      [decoded.auth_user_id],
    );

    if (!userResult.rows.length) throw createError(404, "User not found");

    const user = userResult.rows[0];
    if (user.is_suspended) throw createError(403, "Account suspended");
    if (user.email_status !== "verified")
      throw createError(403, "Email not verified");

    const tokens = await createTokens(user, req);
    return { ...tokens, authUserId: user.auth_user_id, role: user.role };
  } catch (err) {
    if (err.name === "TokenExpiredError")
      throw createError(401, "Refresh token expired");
    throw err;
  }
};

/**
 * Get user's active sessions from DB
 */
const getUserSessions = async (authUserId) => {
  try {
    const result = await pool.query(
      `SELECT id, device_id, device_info, ip_address, 
              created_at, last_used_at, user_agent
       FROM auth.refresh_tokens
       WHERE auth_user_id = $1 
       AND revoked = false 
       AND expires_at > NOW()
       ORDER BY last_used_at DESC`,
      [authUserId],
    );

    return result.rows.map((row) => ({
      sessionId: row.id,
      deviceId: row.device_id,
      deviceInfo:
        typeof row.device_info === "string"
          ? JSON.parse(row.device_info)
          : row.device_info,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
      lastUsedAt: row.last_used_at,
      userAgent: row.user_agent,
    }));
  } catch (err) {
    if (err.code === "42P01") {
      return []; // Table doesn't exist yet
    }
    logger.error({ err }, "getUserSessions error");
    return [];
  }
};

/**
 * Revoke a specific session by ID
 */
const revokeSession = async (authUserId, sessionId) => {
  try {
    const result = await pool.query(
      `UPDATE auth.refresh_tokens 
       SET revoked = true, revoked_at = NOW() 
       WHERE id = $1 AND auth_user_id = $2
       RETURNING id`,
      [sessionId, authUserId],
    );

    return result.rowCount > 0;
  } catch (err) {
    logger.error({ err }, "revokeSession error");
    return false;
  }
};

/**
 * Revoke all refresh tokens for a user (logout all devices)
 */
const revokeAllUserTokens = async (authUserId) => {
  try {
    const result = await pool.query(
      `UPDATE auth.refresh_tokens 
       SET revoked = true, revoked_at = NOW() 
       WHERE auth_user_id = $1 AND revoked = false
       RETURNING id`,
      [authUserId],
    );

    logger.info(
      { authUserId, count: result.rowCount },
      "Revoked user refresh tokens",
    );
    return result.rowCount;
  } catch (err) {
    logger.error({ err }, "revokeAllUserTokens error");
    return 0;
  }
};

/**
 * Revoke a specific refresh token
 */
const revokeRefreshToken = async (refreshToken) => {
  try {
    const tokenHash = hashToken(refreshToken);

    const result = await pool.query(
      `UPDATE auth.refresh_tokens 
       SET revoked = true, revoked_at = NOW() 
       WHERE token_hash = $1
       RETURNING id`,
      [tokenHash],
    );

    return result.rowCount > 0;
  } catch (err) {
    logger.error({ err }, "revokeRefreshToken error");
    return false;
  }
};

/**
 * Clean up expired tokens (call periodically)
 */
const cleanupExpiredTokens = async () => {
  try {
    const result = await pool.query(
      `DELETE FROM auth.refresh_tokens 
       WHERE expires_at < NOW() OR (revoked = true AND revoked_at < NOW() - INTERVAL '7 days')
       RETURNING id`,
    );

    logger.info(
      { count: result.rowCount },
      "Cleaned up expired/revoked tokens",
    );
    return result.rowCount;
  } catch (err) {
    logger.error({ err }, "cleanupExpiredTokens error");
    return 0;
  }
};

module.exports = {
  createTokens,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  getUserSessions,
  revokeSession,
  cleanupExpiredTokens,
  generateDeviceId,
  parseUserAgent,
  hashToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
