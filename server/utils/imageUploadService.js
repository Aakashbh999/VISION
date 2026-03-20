const pool = require("../config/db");
const XPService = require("../services/xpService");
const { successResponse, errorResponse } = require("./response");

/**
 * Shared utility for handling image uploads with cooldown and VXP bypass logic.
 * Eliminates ~120 lines of duplicated transaction code across 4 endpoints.
 *
 * @param {Object} params
 * @param {Object} params.req - Express request object (must contain .file)
 * @param {Object} params.res - Express response object
 * @param {string} params.userId - User initiating the action
 * @param {boolean} params.cooldownActive - Whether the cooldown is currently active
 * @param {boolean} params.spendVxp - Whether the user chose to spend VXP to bypass
 * @param {number} params.vxpCost - Cost in VXP to bypass
 * @param {string} params.vxpLogMessage - Message for the XP transaction log
 * @param {boolean} params.useSkip - Whether the user chose to use a free skip
 * @param {string} [params.skipQuery] - Optional SQL query to deduct a free skip
 * @param {Array} [params.skipParams] - Optional parameters for the skip query
 * @param {string} params.updateQuery - SQL query to update the image. Must expect $1=url, $2=publicId as first 2 params.
 * @param {Array} params.updateParams - Additional parameters for the update query (starting from $3)
 * @param {string} params.successMessage - Message to send on success
 * @param {string} params.returnKey - Key to use in the success payload for the image URL (e.g., 'group_image', 'profile_image')
 */
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

    // 1. Handle VXP bypass
    if (cooldownActive && spendVxp) {
      const stats = await XPService.getUserStats(userId);
      if (!stats || stats.total_xp < vxpCost) {
        await client.query("ROLLBACK");
        return errorResponse(res, `Need ${vxpCost} VXP to bypass cooldown`, 403);
      }
      await XPService.updateUserXP(userId, -vxpCost, vxpLogMessage, client);
    }

    // CloudinaryStorage sets req.file.path (URL) and req.file.filename (public_id)
    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    // 2. Handle free skip deduction
    if (cooldownActive && useSkip && skipQuery) {
      await client.query(skipQuery, skipParams);
    }

    // 3. Update the database record
    await client.query(updateQuery, [imageUrl, publicId, ...updateParams]);

    await client.query("COMMIT");

    return successResponse(
      res,
      { [returnKey]: imageUrl },
      successMessage
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("handleImageUploadWithCooldown error:", err);
    return errorResponse(res, "Failed to update image");
  } finally {
    client.release();
  }
}

module.exports = {
  handleImageUploadWithCooldown,
};
