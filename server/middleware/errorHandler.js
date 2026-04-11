/**
 * errorHandler.js
 * Centralized error handling middleware.
 */
const logger = require("../utils/logger");
const env = require("../config/env");

module.exports = (err, req, res, next) => {
  logger.error(
    { err, path: req.originalUrl, method: req.method },
    "Global error caught",
  );

  let statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode >= 500 && env.NODE_ENV === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message,
    // Provide stack trace only in development
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
