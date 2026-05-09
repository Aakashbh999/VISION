/**
 * errorHandler.js
 * Centralized error handling middleware.
 */
const logger = require("../utils/logger");
const env = require("../config/env");

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const logContext = { err, path: req.originalUrl, method: req.method };

  if (statusCode >= 500) {
    logger.error(logContext, "Global error caught");
  } else {
    // 4xx responses are expected request failures, not server faults.
    logger.warn(logContext, "Request failed");
  }

  const message =
    statusCode >= 500 && env.NODE_ENV === "production"
      ? "Server Failure"
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message,
    // Provide stack trace only in development
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
