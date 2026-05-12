/**
 * XP (Experience Points) Controller
 * Manages user experience points and gamification level progression.
 * Provides XP update interface and stats retrieval for the gamification system.
 *
 * Features:
 * - XP amount updates with reason tracking (for auditing)
 * - User level calculation based on total XP
 * - User statistics retrieval (XP, level, progress to next level)
 * - Internal service export for XP updates from other controllers
 * - Transaction support for atomic XP changes
 */

const XPService = require("../services/xpService");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

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
