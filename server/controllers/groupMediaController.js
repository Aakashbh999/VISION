const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");
const { handleImageUploadWithCooldown } = require("../utils/imageUploadService");
const { isCooldownActive, getCooldownDaysLeft } = require("../utils/validation");
const {
  PROFILE_PIC_COOLDOWN_DAYS,
  BANNER_COOLDOWN_DAYS,
  VXP_BYPASS_COST,
} = require("../utils/constants");
const { getMembership, hasGroupPermission } = require("../utils/groupPermissions");

/* ===============================
   UPDATE GROUP IMAGE (with cooldown/VXP)
================================ */
exports.updateGroupImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;
    const { use_skip, spend_vxp } = req.body;

    const group = await pool.query(
      `SELECT created_by, last_profile_pic_update, free_skips_remaining FROM portal.study_groups WHERE group_id = $1`,
      [id],
    );
    if (!group.rows.length) return errorResponse(res, "Group not found", 404);
    const membership = await getMembership(id, userId);
    if (
      group.rows[0].created_by !== userId &&
      !hasGroupPermission(membership, "edit_profile")
    )
      return errorResponse(
        res,
        "You do not have permission to update the group image",
        403,
      );

    const { last_profile_pic_update, free_skips_remaining } = group.rows[0];
    const cooldownActive = isCooldownActive(
      last_profile_pic_update,
      PROFILE_PIC_COOLDOWN_DAYS,
    );

    if (cooldownActive && !use_skip && !spend_vxp) {
      const daysLeft = getCooldownDaysLeft(last_profile_pic_update, PROFILE_PIC_COOLDOWN_DAYS);
      return errorResponse(
        res,
        `Image cooldown active. ${daysLeft} day(s) remaining.`,
        429,
      );
    }
    if (cooldownActive && use_skip && free_skips_remaining <= 0) {
      return errorResponse(
        res,
        "No free skips remaining. Spend VXP to bypass.",
        429,
      );
    }

    return handleImageUploadWithCooldown({
      req,
      res,
      userId,
      cooldownActive,
      spendVxp: Boolean(spend_vxp === "true" || spend_vxp === true),
      vxpCost: VXP_BYPASS_COST,
      vxpLogMessage: "Group image cooldown bypass",
      useSkip: Boolean(use_skip === "true" || use_skip === true),
      skipQuery: `UPDATE portal.study_groups SET free_skips_remaining = free_skips_remaining - 1 WHERE group_id = $1`,
      skipParams: [id],
      updateQuery: `UPDATE portal.study_groups SET group_image = $1, group_image_public_id = $2, last_profile_pic_update = NOW() WHERE group_id = $3`,
      updateParams: [id],
      successMessage: "Group image updated",
      returnKey: "group_image",
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to update group image");
  }
};

/* ===============================
   UPDATE GROUP BANNER
================================ */
exports.updateGroupBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;
    const { use_skip, spend_vxp } = req.body;

    const group = await pool.query(
      `SELECT created_by, last_banner_update, free_skips_remaining FROM portal.study_groups WHERE group_id = $1`,
      [id],
    );
    if (!group.rows.length) return errorResponse(res, "Group not found", 404);
    const membership = await getMembership(id, userId);
    if (
      group.rows[0].created_by !== userId &&
      !hasGroupPermission(membership, "edit_profile")
    ) {
      return errorResponse(
        res,
        "You do not have permission to update the banner",
        403,
      );
    }

    const { last_banner_update, free_skips_remaining } = group.rows[0];
    const cooldownActive = isCooldownActive(
      last_banner_update,
      BANNER_COOLDOWN_DAYS,
    );

    if (cooldownActive && !use_skip && !spend_vxp) {
      const daysLeft = getCooldownDaysLeft(last_banner_update, BANNER_COOLDOWN_DAYS);
      return errorResponse(
        res,
        `Banner cooldown active. ${daysLeft} day(s) remaining.`,
        429,
      );
    }
    if (cooldownActive && use_skip && free_skips_remaining <= 0) {
      return errorResponse(res, "No free skips remaining.", 429);
    }

    return handleImageUploadWithCooldown({
      req,
      res,
      userId,
      cooldownActive,
      spendVxp: Boolean(spend_vxp === "true" || spend_vxp === true),
      vxpCost: VXP_BYPASS_COST,
      vxpLogMessage: "Group banner cooldown bypass",
      useSkip: Boolean(use_skip === "true" || use_skip === true),
      skipQuery: `UPDATE portal.study_groups SET free_skips_remaining = free_skips_remaining - 1 WHERE group_id = $1`,
      skipParams: [id],
      updateQuery: `UPDATE portal.study_groups SET banner_image = $1, banner_image_public_id = $2, last_banner_update = NOW() WHERE group_id = $3`,
      updateParams: [id],
      successMessage: "Banner updated",
      returnKey: "banner_image",
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to update banner");
  }
};
