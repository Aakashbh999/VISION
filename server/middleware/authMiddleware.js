const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const env = require("../config/env");
const logger = require("../utils/logger");
const { loadAuthUserContext } = require("../utils/authUserContext");

exports.verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(createError(401, "Unauthorized"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const userContext = await loadAuthUserContext(decoded.auth_user_id);
    if (!userContext) {
      return next(createError(401, "User not found"));
    }
    if (userContext.is_suspended) {
      return next(
        createError(403, "Your account has been suspended. Contact admin."),
      );
    }

    req.user = userContext;

    next();
  } catch (err) {
    logger.warn({ err }, "JWT verification failed");
    return next(createError(401, "Invalid token"));
  }
};

// 🔐 Restrict Portal Access Until Approved
exports.requireApprovedStudent = (req, res, next) => {
  const { email_status, student_status, role, is_moderator } = req.user;

  // Admins and Moderators bypass student-specific approval logic
  if (role === "admin" || is_moderator) {
    return next();
  }

  if (email_status !== "verified") {
    return next(createError(403, "Email not verified"));
  }

  if (student_status !== "approved") {
    return next(createError(403, "Awaiting admin approval"));
  }

  next();
};

// 🔓 Optional JWT - continues without auth if no token provided
exports.optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided - continue as unauthenticated
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const userContext = await loadAuthUserContext(decoded.auth_user_id);
    if (!userContext || userContext.is_suspended) {
      req.user = null;
      return next();
    }

    req.user = userContext;

    next();
  } catch (err) {
    // Token invalid - continue as unauthenticated
    req.user = null;
    next();
  }
};
