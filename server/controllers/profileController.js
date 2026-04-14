const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const { feed } = require("../utils/activityService");
const { successResponse, errorResponse } = require("../utils/response");
const {
  handleImageUploadWithCooldown,
} = require("../utils/imageUploadService");
const XPService = require("../services/xpService");
const {
  countWords,
  isCooldownActive,
  getCooldownDaysLeft,
} = require("../utils/validation");
const {
  calculateSemesterFromBatch,
  resolveEffectiveSemester,
} = require("../utils/academicUtils");
const { buildPresenceSelect } = require("../utils/presence");
const {
  PROFILE_PIC_COOLDOWN_DAYS,
  BANNER_COOLDOWN_DAYS,
  VXP_BYPASS_COST,
  MAX_BIO_WORDS,
} = require("../utils/constants");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");
const {
  parsePagination,
  buildPaginationMeta,
} = require("../utils/pagination");

function normalizeAcademicProfile(profile) {
  if (!profile) return profile;

  const calculatedSemester = profile.batch_year
    ? calculateSemesterFromBatch(profile.batch_year)
    : null;

  return {
    ...profile,
    calculated_semester: calculatedSemester,
    semester: resolveEffectiveSemester({
      semester: profile.semester,
      batchYear: profile.batch_year,
      semesterIsManual: profile.semester_is_manual,
    }),
  };
}

/**
 * GET /api/profile/:userId  — Public profile view
 */
exports.getPublicProfile = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const viewerId = req.user?.portal_user_id;

  const result = await pool.query(
    `SELECT
        u.user_id,
        u.full_name,
        u.bio,
        u.profile_image,
        u.banner_image,
        u.reputation_points,
        u.created_at,
        u.semester,
        u.batch_year,
        u.semester_is_manual,
        u.program_id,
        u.is_moderator,
        ${buildPresenceSelect("u")},
        p.program_name,
        us.total_xp,
        us.current_level,
        COUNT(DISTINCT d.discussion_id) AS discussion_count,
        COUNT(DISTINCT r.resource_id)   AS resource_count,
        (SELECT COUNT(*) FROM portal.user_followers WHERE following_id = u.user_id) AS followers_count,
        (SELECT COUNT(*) FROM portal.user_followers WHERE follower_id  = u.user_id) AS following_count,
        u.linkedin_url,
        u.facebook_url,
        u.instagram_url,
        u.youtube_url,
        u.reddit_url,
        u.twitter_url,
        u.github_url,
        u.website_url
        ${
          viewerId
            ? `,
        EXISTS(
          SELECT 1 FROM portal.user_followers
          WHERE follower_id = $2 AND following_id = u.user_id
        ) AS is_following`
            : ", FALSE AS is_following"
        }
       FROM portal.users u
       LEFT JOIN portal.programs p     ON p.program_id = u.program_id
       LEFT JOIN portal.user_stats us  ON us.user_id   = u.user_id
       LEFT JOIN portal.discussions d  ON d.user_id     = u.user_id AND d.deleted_at IS NULL AND d.is_deleted = FALSE
       LEFT JOIN portal.resources r    ON r.created_by = u.user_id AND r.deleted_at IS NULL
       WHERE u.user_id = $1 AND u.status = 'active'
       GROUP BY u.user_id, u.last_seen_at, p.program_name, us.total_xp, us.current_level`,
    viewerId ? [userId, viewerId] : [userId],
  );

  if (!result.rows.length) {
    return errorResponse(res, "User not found", 404);
  }

  const badgesRes = await pool.query(
    `SELECT badge_name, earned_at FROM portal.user_badges WHERE user_id = $1 ORDER BY earned_at DESC`,
    [userId],
  );

  return successResponse(res, {
    ...normalizeAcademicProfile(result.rows[0]),
    badges: badgesRes.rows,
  });
});

/**
 * GET /api/profile/me  — Own full profile (private fields included)
 */
exports.getOwnProfile = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;

  const result = await pool.query(
    `SELECT
        u.user_id,
        u.full_name,
        u.bio,
        u.profile_image,
        u.banner_image,
        u.reputation_points,
        u.created_at,
        u.semester,
        u.batch_year,
        u.semester_is_manual,
        u.program_id,
        u.is_moderator,
        u.last_profile_pic_update,
        u.last_banner_update,
        u.profile_pic_free_skips,
        u.banner_free_skips,
        ${buildPresenceSelect("u")},
        a.email,
        a.email_status,
        p.program_name,
        us.total_xp,
        us.current_level,
        COUNT(DISTINCT d.discussion_id) AS discussion_count,
        COUNT(DISTINCT r.resource_id)   AS resource_count,
        (SELECT COUNT(*) FROM portal.user_followers WHERE following_id = u.user_id) AS followers_count,
        (SELECT COUNT(*) FROM portal.user_followers WHERE follower_id  = u.user_id) AS following_count,
        u.linkedin_url,
        u.facebook_url,
        u.instagram_url,
        u.youtube_url,
        u.reddit_url,
        u.twitter_url,
        u.github_url,
        u.website_url
       FROM portal.users u
       JOIN auth.users a               ON a.auth_user_id = u.auth_user_id
       LEFT JOIN portal.programs p     ON p.program_id = u.program_id
       LEFT JOIN portal.user_stats us  ON us.user_id   = u.user_id
       LEFT JOIN portal.discussions d  ON d.user_id     = u.user_id AND d.deleted_at IS NULL AND d.is_deleted = FALSE
       LEFT JOIN portal.resources r    ON r.created_by = u.user_id AND r.deleted_at IS NULL
       WHERE u.user_id = $1
       GROUP BY u.user_id, u.last_seen_at, a.email, a.email_status, p.program_name, us.total_xp, us.current_level`,
    [userId],
  );

  if (!result.rows.length) {
    return errorResponse(res, "Profile not found", 404);
  }

  const profile = normalizeAcademicProfile(result.rows[0]);

  // Compute cooldown state for the owner
  profile.profile_pic_cooldown_active = isCooldownActive(
    profile.last_profile_pic_update,
    PROFILE_PIC_COOLDOWN_DAYS,
  );
  profile.banner_cooldown_active = isCooldownActive(
    profile.last_banner_update,
    BANNER_COOLDOWN_DAYS,
  );

  const badgesRes = await pool.query(
    `SELECT badge_name, earned_at FROM portal.user_badges WHERE user_id = $1 ORDER BY earned_at DESC`,
    [userId],
  );

  return successResponse(res, { ...profile, badges: badgesRes.rows });
});

/**
 * PATCH /api/profile/me  — Update editable profile fields in one request
 */
exports.updateProfile = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;
  const {
    full_name,
    bio,
    program_id,
    batch_year,
    semester,
    semester_is_manual,
    linkedin_url,
    facebook_url,
    instagram_url,
    youtube_url,
    reddit_url,
    twitter_url,
    github_url,
    website_url,
  } = req.body;

  const currentResult = await pool.query(
    `SELECT full_name, bio, program_id, semester, batch_year, semester_is_manual,
              linkedin_url, facebook_url, instagram_url, youtube_url, reddit_url, twitter_url, github_url, website_url
       FROM portal.users
       WHERE user_id = $1`,
    [userId],
  );

  if (!currentResult.rows.length) {
    return errorResponse(res, "Profile not found", 404);
  }

  const current = currentResult.rows[0];

  const nextFullName =
    full_name !== undefined ? String(full_name).trim() : current.full_name;
  const nextBio = bio !== undefined ? String(bio).trim() : current.bio;
  const nextProgramId =
    program_id !== undefined && program_id !== null && program_id !== ""
      ? Number.parseInt(program_id, 10)
      : program_id === null || program_id === ""
        ? null
        : current.program_id;
  const nextBatchYear =
    batch_year !== undefined && batch_year !== null && batch_year !== ""
      ? Number.parseInt(batch_year, 10)
      : batch_year === null || batch_year === ""
        ? null
        : current.batch_year;
  const nextSemesterIsManual =
    semester_is_manual !== undefined
      ? semester_is_manual === true || semester_is_manual === "true"
      : current.semester_is_manual;

  const nextLinkedin =
    linkedin_url !== undefined ? linkedin_url : current.linkedin_url;
  const nextFacebook =
    facebook_url !== undefined ? facebook_url : current.facebook_url;
  const nextInstagram =
    instagram_url !== undefined ? instagram_url : current.instagram_url;
  const nextYoutube =
    youtube_url !== undefined ? youtube_url : current.youtube_url;
  const nextReddit = reddit_url !== undefined ? reddit_url : current.reddit_url;
  const nextTwitter =
    twitter_url !== undefined ? twitter_url : current.twitter_url;
  const nextGithub = github_url !== undefined ? github_url : current.github_url;
  const nextWebsite =
    website_url !== undefined ? website_url : current.website_url;

  let nextSemester =
    semester !== undefined && semester !== null && semester !== ""
      ? Number.parseInt(semester, 10)
      : current.semester;

  if (!nextFullName) {
    return errorResponse(res, "Full name is required", 400);
  }
  if (typeof nextBio !== "string") {
    return errorResponse(res, "Bio must be text", 400);
  }
  if (countWords(nextBio) > MAX_BIO_WORDS) {
    return errorResponse(res, "Bio must be 130 words or less", 400);
  }
  if (nextProgramId !== null && !Number.isFinite(nextProgramId)) {
    return errorResponse(res, "Invalid program", 400);
  }
  if (
    nextBatchYear !== null &&
    (!Number.isFinite(nextBatchYear) || nextBatchYear < 2000)
  ) {
    return errorResponse(res, "Invalid batch year", 400);
  }

  if (nextBatchYear && !nextSemesterIsManual) {
    nextSemester = calculateSemesterFromBatch(nextBatchYear);
  }

  if (!Number.isFinite(nextSemester)) {
    return errorResponse(res, "A valid semester is required", 400);
  }

  const updateResult = await pool.query(
    `UPDATE portal.users
       SET full_name = $1,
           bio = $2,
           program_id = $3,
           batch_year = $4,
           semester = $5,
           semester_is_manual = $6,
           linkedin_url = $8,
           facebook_url = $9,
           instagram_url = $10,
           youtube_url = $11,
           reddit_url = $12,
           twitter_url = $13,
           github_url = $14,
           website_url = $15
       WHERE user_id = $7
       RETURNING user_id, full_name, bio, program_id, semester, batch_year, semester_is_manual,
                 linkedin_url, facebook_url, instagram_url, youtube_url, reddit_url, twitter_url, github_url, website_url`,
    [
      nextFullName,
      nextBio,
      nextProgramId,
      nextBatchYear,
      nextSemester,
      nextSemesterIsManual,
      userId,
      nextLinkedin,
      nextFacebook,
      nextInstagram,
      nextYoutube,
      nextReddit,
      nextTwitter,
      nextGithub,
      nextWebsite,
    ],
  );

  return successResponse(
    res,
    normalizeAcademicProfile(updateResult.rows[0]),
    "Profile updated successfully",
  );
});

/**
 * PATCH /api/profile/bio  — Update bio
 */
exports.updateBio = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;
  const { bio } = req.body;

  if (bio === undefined) {
    return errorResponse(res, "Bio field is required", 400);
  }
  if (typeof bio !== "string") {
    return errorResponse(res, "Bio must be text", 400);
  }

  if (countWords(bio) > MAX_BIO_WORDS) {
    return errorResponse(res, "Bio must be 130 words or less", 400);
  }

  await pool.query(`UPDATE portal.users SET bio = $1 WHERE user_id = $2`, [
    bio.trim(),
    userId,
  ]);

  return successResponse(res, { bio: bio.trim() }, "Bio updated successfully");
});

/**
 * POST /api/profile/image  — Update profile picture (with cooldown + VXP bypass)
 */
exports.updateProfileImage = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;
  const { use_skip, spend_vxp } = req.body;

  // Get current cooldown state
  const current = await pool.query(
    `SELECT last_profile_pic_update, profile_pic_free_skips FROM portal.users WHERE user_id = $1`,
    [userId],
  );
  if (!current.rows.length) return errorResponse(res, "User not found", 404);

  const { last_profile_pic_update, profile_pic_free_skips } = current.rows[0];
  const cooldownActive = isCooldownActive(
    last_profile_pic_update,
    PROFILE_PIC_COOLDOWN_DAYS,
  );

  if (cooldownActive) {
    if (use_skip === "true" || use_skip === true) {
      if (profile_pic_free_skips <= 0) {
        return errorResponse(
          res,
          "No free skips remaining. Spend VXP to bypass.",
          429,
        );
      }
    } else if (spend_vxp === "true" || spend_vxp === true) {
      // VXP deduction handled in transaction below
    } else {
      const daysLeft = getCooldownDaysLeft(
        last_profile_pic_update,
        PROFILE_PIC_COOLDOWN_DAYS,
      );
      return errorResponse(
        res,
        `Profile picture cooldown active. ${daysLeft} day(s) remaining.`,
        429,
      );
    }
  }

  return handleImageUploadWithCooldown({
    req,
    res,
    userId,
    cooldownActive,
    spendVxp: Boolean(spend_vxp === "true" || spend_vxp === true),
    vxpCost: VXP_BYPASS_COST,
    vxpLogMessage: "Profile pic cooldown bypass",
    useSkip: Boolean(use_skip === "true" || use_skip === true),
    skipQuery: `UPDATE portal.users SET profile_pic_free_skips = profile_pic_free_skips - 1 WHERE user_id = $1`,
    skipParams: [userId],
    updateQuery: `UPDATE portal.users SET profile_image = $1, profile_image_public_id = $2, last_profile_pic_update = NOW() WHERE user_id = $3`,
    updateParams: [userId],
    successMessage: "Profile picture updated successfully",
    returnKey: "profile_image",
  });
});

/**
 * POST /api/profile/banner  — Update banner image (with cooldown + VXP bypass)
 */
exports.updateProfileBanner = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;
  const { use_skip, spend_vxp } = req.body;

  const current = await pool.query(
    `SELECT last_banner_update, banner_free_skips FROM portal.users WHERE user_id = $1`,
    [userId],
  );
  if (!current.rows.length) return errorResponse(res, "User not found", 404);

  const { last_banner_update, banner_free_skips } = current.rows[0];
  const cooldownActive = isCooldownActive(
    last_banner_update,
    BANNER_COOLDOWN_DAYS,
  );

  if (cooldownActive) {
    if (use_skip === "true" || use_skip === true) {
      if (banner_free_skips <= 0) {
        return errorResponse(
          res,
          "No free skips remaining. Spend VXP to bypass.",
          429,
        );
      }
    } else if (spend_vxp === "true" || spend_vxp === true) {
      // handled in transaction
    } else {
      const daysLeft = getCooldownDaysLeft(
        last_banner_update,
        BANNER_COOLDOWN_DAYS,
      );
      return errorResponse(
        res,
        `Banner cooldown active. ${daysLeft} day(s) remaining.`,
        429,
      );
    }
  }

  return handleImageUploadWithCooldown({
    req,
    res,
    userId,
    cooldownActive,
    spendVxp: Boolean(spend_vxp === "true" || spend_vxp === true),
    vxpCost: VXP_BYPASS_COST,
    vxpLogMessage: "Banner cooldown bypass",
    useSkip: Boolean(use_skip === "true" || use_skip === true),
    skipQuery: `UPDATE portal.users SET banner_free_skips = banner_free_skips - 1 WHERE user_id = $1`,
    skipParams: [userId],
    updateQuery: `UPDATE portal.users SET banner_image = $1, banner_image_public_id = $2, last_banner_update = NOW() WHERE user_id = $3`,
    updateParams: [userId],
    successMessage: "Banner updated successfully",
    returnKey: "banner_image",
  });
});

/**
 * Shared helper to remove either profile image or banner
 */
async function handleImageRemoval(req, res, type) {
  const userId = req.user.portal_user_id;
  const isProfile = type === "profile";

  // Determine column names
  const publicIdCol = isProfile
    ? "profile_image_public_id"
    : "banner_image_public_id";
  const imageCol = isProfile ? "profile_image" : "banner_image";
  const returnKey = isProfile ? "profile_image" : "banner_image";
  const successMsg = isProfile
    ? "Profile picture removed successfully"
    : "Banner removed successfully";

  const current = await pool.query(
    `SELECT ${publicIdCol} FROM portal.users WHERE user_id = $1`,
    [userId],
  );

  if (!current.rows.length) {
    return errorResponse(res, "User not found", 404);
  }

  const publicId = current.rows[0][publicIdCol];
  if (publicId) {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  }

  await pool.query(
    `UPDATE portal.users SET ${imageCol} = NULL, ${publicIdCol} = NULL WHERE user_id = $1`,
    [userId],
  );

  return successResponse(res, { [returnKey]: null }, successMsg);
}

/**
 * DELETE /api/profile/image  — Remove profile picture
 */
exports.removeProfileImage = async (req, res) => {
  return handleImageRemoval(req, res, "profile");
};

/**
 * DELETE /api/profile/banner  — Remove banner image
 */
exports.removeProfileBanner = async (req, res) => {
  return handleImageRemoval(req, res, "banner");
};

/**
 * POST /api/profile/:userId/follow
 */
exports.followUser = catchAsync(async (req, res) => {
  const followerId = req.user.portal_user_id;
  const followingId = parseInt(req.params.userId);

  if (followerId === followingId) {
    return errorResponse(res, "You cannot follow yourself", 400);
  }

  const result = await pool.query(
    `INSERT INTO portal.user_followers (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [followerId, followingId],
  );

  if (result.rowCount > 0) {
    try {
      await feed({
        actorId: followerId,
        actionType: "user_followed",
        referenceType: "user",
        referenceId: followingId,
        metadata: { followed_user_id: followingId },
      });
    } catch (feedErr) {
      logger.warn({ err: feedErr }, "Follow feed event failed");
    }
  }

  return successResponse(res, { is_following: true }, "Now following user");
});

/**
 * DELETE /api/profile/:userId/follow
 */
exports.unfollowUser = catchAsync(async (req, res) => {
  const followerId = req.user.portal_user_id;
  const followingId = parseInt(req.params.userId);

  await pool.query(
    `DELETE FROM portal.user_followers WHERE follower_id = $1 AND following_id = $2`,
    [followerId, followingId],
  );

  return successResponse(res, { is_following: false }, "Unfollowed user");
});

/**
 * GET /api/profile/:userId/followers
 */
exports.getFollowers = catchAsync(async (req, res) => {
  const viewerId = req.user?.portal_user_id || null;
  const { page, limit, offset } = parsePagination(req.query, {
    defaultLimit: 12,
    maxLimit: 50,
  });
  const { userId } = req.params;
  const targetUserId = userId === "me" ? viewerId : parseInt(userId, 10);

  if (!targetUserId) {
    return errorResponse(res, "Invalid user id", 400);
  }

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT
            u.user_id,
            u.full_name,
            u.profile_image,
            uf.followed_at,
            EXISTS(
              SELECT 1 FROM portal.user_followers
              WHERE follower_id = $2 AND following_id = u.user_id
            ) AS is_following,
            EXISTS(
              SELECT 1 FROM portal.user_followers
              WHERE follower_id = u.user_id AND following_id = $2
            ) AS is_mutual
         FROM portal.user_followers uf
         JOIN portal.users u ON u.user_id = uf.follower_id
         WHERE uf.following_id = $1 AND u.status = 'active'
         ORDER BY uf.followed_at DESC
         LIMIT $3 OFFSET $4`,
      [targetUserId, viewerId, limit, offset],
    ),
    pool.query(
      `SELECT COUNT(*)
         FROM portal.user_followers uf
         JOIN portal.users u ON u.user_id = uf.follower_id
         WHERE uf.following_id = $1 AND u.status = 'active'`,
      [targetUserId],
    ),
  ]);

  const total = parseInt(countResult.rows[0].count, 10);

  return successResponse(res, {
    data: dataResult.rows,
    pagination: buildPaginationMeta({ total, page, limit }),
  });
});

/**
 * GET /api/profile/:userId/following
 */
exports.getFollowing = catchAsync(async (req, res) => {
  const viewerId = req.user?.portal_user_id || null;
  const { page, limit, offset } = parsePagination(req.query, {
    defaultLimit: 12,
    maxLimit: 50,
  });
  const { userId } = req.params;
  const targetUserId = userId === "me" ? viewerId : parseInt(userId, 10);

  if (!targetUserId) {
    return errorResponse(res, "Invalid user id", 400);
  }

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT
            u.user_id,
            u.full_name,
            u.profile_image,
            uf.followed_at,
            TRUE AS is_following,
            EXISTS(
              SELECT 1 FROM portal.user_followers
              WHERE follower_id = u.user_id AND following_id = $2
            ) AS is_mutual
         FROM portal.user_followers uf
         JOIN portal.users u ON u.user_id = uf.following_id
         WHERE uf.follower_id = $1 AND u.status = 'active'
         ORDER BY uf.followed_at DESC
         LIMIT $3 OFFSET $4`,
      [targetUserId, viewerId, limit, offset],
    ),
    pool.query(
      `SELECT COUNT(*)
         FROM portal.user_followers uf
         JOIN portal.users u ON u.user_id = uf.following_id
         WHERE uf.follower_id = $1 AND u.status = 'active'`,
      [targetUserId],
    ),
  ]);

  const total = parseInt(countResult.rows[0].count, 10);

  return successResponse(res, {
    data: dataResult.rows,
    pagination: buildPaginationMeta({ total, page, limit }),
  });
});
