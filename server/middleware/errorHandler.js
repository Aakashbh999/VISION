/**
 * errorHandler.js
 * Centralized error handling middleware.
 */
module.exports = (err, req, res, next) => {
  console.error("Global Error Caught:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mapped string-based service errors from older controllers
  if (message.includes("Not authorized") || message.includes("Edit window expired") || message.includes("suspended") || message.includes("cannot")) {
    statusCode = 403;
  } else if (message.includes("not found")) {
    statusCode = 404;
  } else if (message.includes("Insufficient") || message.includes("Maximum") || message.includes("already") || message.includes("bypass cost") || message.includes("Invalid credentials")) {
    statusCode = 400;
  } else if (message.includes("cooldown active") || message.includes("skips remaining")) {
    statusCode = 429;
  }

  res.status(statusCode).json({
    error: message,
    // Provide stack trace only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
