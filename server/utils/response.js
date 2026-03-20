/**
 * Standardizes API responses across the platform.
 * Follows the 'Bulletproof' standard: { success, data, error, message }
 */
const sendResponse = (res, statusCode, { success = true, data = null, error = null, message = null }) => {
  return res.status(statusCode).json({
    success,
    data,
    error,
    message
  });
};

const successResponse = (res, data, message = "Operation successful") => {
  return sendResponse(res, 200, { success: true, data, message });
};

const errorResponse = (res, error, statusCode = 500, message = "An error occurred") => {
  return sendResponse(res, statusCode, { success: false, error, message });
};

module.exports = {
  successResponse,
  errorResponse
};
