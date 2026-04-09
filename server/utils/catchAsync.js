/**
 * catchAsync.js
 * Wraps asynchronous controller functions to forward rejected promises to the global error handler.
 */
module.exports = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
