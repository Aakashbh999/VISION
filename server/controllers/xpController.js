const XPService = require("../services/xpService");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

/**
 * Controller to expose XP utility for other controllers to import
 * as per the integration rules.
 */
exports.updateUserXP = async (userId, amount, reason, client = null) => {
  return await XPService.updateUserXP(userId, amount, reason, client);
};

exports.getUserStats = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;
  const stats = await XPService.getUserStats(userId);

  if (!stats) {
    throw createError(404, "Stats not found");
  }

  res.json(stats);
});
