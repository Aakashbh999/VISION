const pool = require("../config/db");
const XPService = require("../services/xpService");
const { successResponse, errorResponse } = require("./response");
const logger = require("./logger");

async function handleImageUploadWithCooldown({
  req,
  res,
  userId,
  cooldownActive,
  spendVxp,
  vxpCost,
  vxpLogMessage,
  useSkip,
  skipQuery,
  skipParams,
  updateQuery,
  updateParams,
  successMessage,
  returnKey,
}) {
  if (!req.file) {
    return errorResponse(res, "No image provided", 400);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (cooldownActive && spendVxp) {
      const stats = await XPService.getUserStats(userId);
      if (!stats || stats.total_xp < vxpCost) {
        await client.query("ROLLBACK");
        return errorResponse(
          res,
          `Need ${vxpCost} VXP to bypass cooldown`,
          403,
        );
      }
      await XPService.updateUserXP(userId, -vxpCost, vxpLogMessage, client);
    }

    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    if (cooldownActive && useSkip && skipQuery) {
      await client.query(skipQuery, skipParams);
    }

    await client.query(updateQuery, [imageUrl, publicId, ...updateParams]);

    await client.query("COMMIT");

    return successResponse(res, { [returnKey]: imageUrl }, successMessage);
  } catch (err) {
    await client.query("ROLLBACK");
    logger.error({ err }, "handleImageUploadWithCooldown error");
    return errorResponse(res, "Failed to update image");
  } finally {
    client.release();
  }
}

module.exports = {
  handleImageUploadWithCooldown,
};
