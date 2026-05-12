

const pool = require("../config/db");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const { UAParser } = require("ua-parser-js");
const logger = require("./logger");
const env = require("../config/env");

const ACCESS_TOKEN_EXPIRY = "30m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_EXPIRY = `${REFRESH_TOKEN_EXPIRY_DAYS}d`;

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

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

const createTokens = async (user, req) => {
  const deviceId = generateDeviceId(req);
  const deviceInfo = parseUserAgent(req.headers["user-agent"]);
  const ipAddress =
    req.ip || req.connection?.remoteAddress || req.headers["x-forwarded-for"];
  const userAgent = req.headers["user-agent"] || "";

  const accessToken = jwt.sign(
    {
      auth_user_id: user.auth_user_id,
      role: user.role,
      type: "access",
    },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );

  const rawRefreshToken = crypto.randomBytes(64).toString("hex");
  const tokenHash = hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

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

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresIn: 15 * 60,
  };
};

const rotateRefreshToken = async (refreshToken, req) => {
  const tokenHash = hashToken(refreshToken);

  try {

    const tokenResult = await pool.query(
      `SELECT rt.*, a.role, a.email_status, p.is_suspended
       FROM auth.refresh_tokens rt
       JOIN auth.users a ON rt.auth_user_id = a.auth_user_id
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       WHERE rt.token_hash = $1`,
      [tokenHash],
    );

    if (!tokenResult.rows.length) {

      return await rotateRefreshTokenJWT(refreshToken, req);
    }

    const token = tokenResult.rows[0];

    if (token.revoked) {

      await pool.query(
        `UPDATE auth.refresh_tokens
         SET revoked = true, revoked_at = NOW()
         WHERE auth_user_id = $1`,
        [token.auth_user_id],
      );
      throw createError(401, "Token reuse detected - all sessions revoked");
    }

    if (new Date(token.expires_at) < new Date()) {
      throw createError(401, "Refresh token expired");
    }

    if (token.is_suspended) {
      throw createError(403, "Account suspended");
    }

    if (token.email_status !== "verified") {
      throw createError(403, "Email not verified");
    }

    await pool.query(
      `UPDATE auth.refresh_tokens
       SET revoked = true, revoked_at = NOW()
       WHERE token_hash = $1`,
      [tokenHash],
    );

    const user = { auth_user_id: token.auth_user_id, role: token.role };
    const tokens = await createTokens(user, req);

    return {
      ...tokens,
      authUserId: token.auth_user_id,
      role: token.role,
    };
  } catch (err) {

    if (err.code === "42P01") {
      return await rotateRefreshTokenJWT(refreshToken, req);
    }
    throw err;
  }
};

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
      return [];
    }
    logger.error({ err }, "getUserSessions error");
    return [];
  }
};

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
