const pool = require("../config/db");
const XPService = require("../services/xpService");
const { successResponse, errorResponse } = require("../utils/response");
const { validateDescription } = require("../utils/validation");
const { MAX_DESCRIPTION_WORDS } = require("../utils/constants");
const {
  getMembership,
  hasGroupPermission,
  normalizePermissions,
} = require("../utils/groupPermissions");

/* ===============================
   GET ALL GROUPS
================================ */
exports.getGroups = async (req, res) => {
  try {
    const { search, sort, degree } = req.query;
    const userId = req.user?.portal_user_id;

    let query = `
      SELECT 
        g.group_id,
        g.name,
        g.description,
        g.created_at,
        g.group_image,
        g.banner_image,
        g.is_public,
        g.privacy_type,
        g.capacity,
        g.created_by,
        g.degree_id,
        ad.full_name AS degree_name,
        u.full_name AS creator,
        COUNT(DISTINCT gm.user_id) AS members,
        ${userId ? `EXISTS(SELECT 1 FROM portal.group_members WHERE group_id = g.group_id AND user_id = $1) AS is_member` : "FALSE AS is_member"},
        ${userId ? `(SELECT role FROM portal.group_members WHERE group_id = g.group_id AND user_id = $1 LIMIT 1) AS member_role` : "NULL AS member_role"},
        (SELECT MAX(gp.created_at) FROM portal.group_posts gp WHERE gp.group_id = g.group_id) AS last_activity
      FROM portal.study_groups g
      JOIN portal.users u ON u.user_id = g.created_by
      LEFT JOIN portal.group_members gm ON gm.group_id = g.group_id AND gm.status = 'approved'
      LEFT JOIN portal.academic_degrees ad ON ad.id = g.degree_id
    `;

    const params = userId ? [userId] : [];
    let paramIndex = params.length;
    const conditions = ["g.privacy_type != 'private'", "g.deleted_at IS NULL"]; // Hide private and deleted groups from listing

    let searchParamIndex = null;
    if (search) {
      paramIndex++;
      searchParamIndex = paramIndex;
      conditions.push(
        `(g.name ILIKE $${paramIndex} OR g.description ILIKE $${paramIndex})`,
      );
      params.push(`%${search}%`);
    }
    if (degree) {
      paramIndex++;
      conditions.push(`g.degree_id = $${paramIndex}`);
      params.push(parseInt(degree));
    }

    query += ` WHERE ${conditions.join(" AND ")}`;
    query += ` GROUP BY g.group_id, g.name, g.description, g.created_at, g.group_image, g.banner_image, g.is_public, g.privacy_type, g.capacity, g.created_by, g.degree_id, ad.full_name, u.full_name`;

    if (searchParamIndex && (!sort || sort === "latest")) {
      query += ` ORDER BY CASE WHEN g.name ILIKE $${searchParamIndex} THEN 0 WHEN g.description ILIKE $${searchParamIndex} THEN 1 ELSE 2 END, g.created_at DESC`;
    } else if (sort === "active") {
      query += ` ORDER BY last_activity DESC NULLS LAST, g.created_at DESC`;
    } else if (sort === "popular") {
      query += ` ORDER BY members DESC, g.created_at DESC`;
    } else {
      query += ` ORDER BY g.created_at DESC`;
    }

    const result = await pool.query(query, params);

    // If searching and no results found, fetch recommendations
    if (search && result.rows.length === 0) {
      const { userSemester, userProgramId, userDegreeId } = req.user;
      const recommendationService = require("../services/recommendationService");
      const recommendations = await recommendationService.getRecommendations(
        userId,
        userSemester,
        userProgramId,
        userDegreeId,
        5,
      );
      return res.json({
        groups: [],
        recommendations,
        noResults: true,
      });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

/* ===============================
   GROUP DETAILS
================================ */
exports.getGroupDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { invite } = req.query; // UUID invite token for private groups
    const userId = req.user?.portal_user_id;

    const group = await pool.query(
      `SELECT 
        g.group_id, g.name, g.description, g.created_at, g.created_by,
        g.group_image, g.banner_image, g.is_public, g.privacy_type,
        g.capacity, g.free_skips_remaining,
        g.last_profile_pic_update, g.last_banner_update,
        g.invite_token,
        g.degree_id,
        ad.full_name AS degree_name,
        u.full_name AS creator,
        u.user_id AS creator_id,
        u.profile_image AS creator_image,
        COUNT(DISTINCT gm.user_id) AS members,
        COUNT(DISTINCT gp.post_id) AS post_count,
        MAX(gp.created_at) AS last_activity,
        ${userId ? `(SELECT role FROM portal.group_members WHERE group_id = g.group_id AND user_id = $2 LIMIT 1) AS member_role` : "NULL AS member_role"},
        ${userId ? `(SELECT permissions FROM portal.group_members WHERE group_id = g.group_id AND user_id = $2 LIMIT 1) AS member_permissions` : "NULL AS member_permissions"},
        ${userId ? `EXISTS(SELECT 1 FROM portal.join_requests WHERE group_id = g.group_id AND user_id = $2 AND status = 'pending') AS has_pending_request` : "FALSE AS has_pending_request"}
      FROM portal.study_groups g
      JOIN portal.users u ON u.user_id = g.created_by
      LEFT JOIN portal.group_members gm ON gm.group_id = g.group_id AND gm.status = 'approved'
      LEFT JOIN portal.group_posts gp ON gp.group_id = g.group_id AND gp.deleted_at IS NULL
      LEFT JOIN portal.academic_degrees ad ON ad.id = g.degree_id
      WHERE g.group_id = $1 AND g.deleted_at IS NULL
      GROUP BY g.group_id, g.name, g.description, g.created_at, g.created_by, g.group_image, g.banner_image, g.is_public, g.privacy_type, g.capacity, g.free_skips_remaining, g.last_profile_pic_update, g.last_banner_update, g.invite_token, g.degree_id, ad.full_name, u.full_name, u.user_id, u.profile_image`,
      userId ? [id, userId] : [id],
    );

    if (!group.rows.length) return errorResponse(res, "Group not found", 404);

    const g = group.rows[0];
    const isOwner = userId && g.created_by === userId;
    const isMember = !!g.member_role;
    const normalizedPermissions = normalizePermissions(
      g.member_role,
      g.member_permissions,
    );

    // Private group: only accessible via valid invite token or if already a member
    if (g.privacy_type === "private" && !isMember) {
      if (!invite || invite !== g.invite_token) {
        return errorResponse(
          res,
          "This group is private. You need an invite link to access it.",
          404,
        );
      }
    }

    // Strip invite_token for non-owners
    if (!isOwner) delete g.invite_token;

    const result = {
      ...g,
      is_owner: isOwner,
      is_member: isMember,
      is_co_admin: g.member_role === "co_admin",
      member_permissions: normalizedPermissions,
      can_manage_users: hasGroupPermission(
        { role: g.member_role, permissions: normalizedPermissions },
        "manage_users",
      ),
      can_moderate_content: hasGroupPermission(
        { role: g.member_role, permissions: normalizedPermissions },
        "moderate_content",
      ),
      can_edit_profile: hasGroupPermission(
        { role: g.member_role, permissions: normalizedPermissions },
        "edit_profile",
      ),
      can_post_notice: hasGroupPermission(
        { role: g.member_role, permissions: normalizedPermissions },
        "post_notice",
      ),
    };

    return successResponse(res, result);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch group details");
  }
};

/* ===============================
   CREATE GROUP
================================ */
exports.createGroup = async (req, res) => {
  try {
    const {
      name,
      description,
      degree_id,
      privacy_type = "public",
      tags,
    } = req.body;
    const userId = req.user.portal_user_id;

    const stats = await XPService.getUserStats(userId);
    if (!stats || stats.total_xp < 500) {
      return res.status(403).json({
        error: "Social Gate Restricted",
        message: "Insufficient XP (500 required).",
      });
    }

    if (!name?.trim()) return errorResponse(res, "Group name is required", 400);
    if (!["public", "request", "private"].includes(privacy_type)) {
      return errorResponse(res, "Invalid privacy_type", 400);
    }
    const descCheck = validateDescription(description, MAX_DESCRIPTION_WORDS);
    if (!descCheck.valid) {
      return errorResponse(res, descCheck.error, 400);
    }

    // Normalize tags: clean, lowercase, deduplicate
    let normalizedTags = null;
    if (Array.isArray(tags) && tags.length > 0) {
      normalizedTags = [
        ...new Set(
          tags
            .map((t) =>
              String(t)
                .toLowerCase()
                .replace(/^#+/, "")
                .replace(/[^a-z0-9_]/g, "")
                .slice(0, 30),
            )
            .filter(Boolean),
        ),
      ].slice(0, 10);
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const group = await client.query(
        `INSERT INTO portal.study_groups (name, description, created_by, degree_id, privacy_type, tags)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          name.trim(),
          description || null,
          userId,
          degree_id || null,
          privacy_type,
          normalizedTags,
        ],
      );

      // Auto-add creator as owner
      await client.query(
        `INSERT INTO portal.group_members (group_id, user_id, role) VALUES ($1, $2, 'owner') ON CONFLICT DO NOTHING`,
        [group.rows[0].group_id, userId],
      );

      await client.query("COMMIT");
      res.status(201).json(group.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create group");
  }
};

/* ===============================
   UPDATE GROUP (name/description/privacy)
================================ */
exports.updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;
    const { name, description, privacy_type } = req.body;

    const group = await pool.query(
      `SELECT created_by FROM portal.study_groups WHERE group_id = $1`,
      [id],
    );
    if (!group.rows.length) return errorResponse(res, "Group not found", 404);

    const membership = await getMembership(id, userId);
    const isOwner = group.rows[0].created_by === userId;

    if (!isOwner && !hasGroupPermission(membership, "edit_profile")) {
      return errorResponse(res, "You cannot edit this group profile", 403);
    }

    if (!isOwner && (name !== undefined || privacy_type !== undefined)) {
      return errorResponse(
        res,
        "Only the owner can change group name or privacy",
        403,
      );
    }

    if (
      privacy_type &&
      !["public", "request", "private"].includes(privacy_type)
    ) {
      return errorResponse(res, "Invalid privacy_type", 400);
    }
    const descCheck = validateDescription(description, MAX_DESCRIPTION_WORDS);
    if (!descCheck.valid) {
      return errorResponse(res, descCheck.error, 400);
    }

    const result = await pool.query(
      `UPDATE portal.study_groups
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           privacy_type = COALESCE($3, privacy_type)
       WHERE group_id = $4
       RETURNING *`,
      [name?.trim() || null, description || null, privacy_type || null, id],
    );

    return successResponse(res, result.rows[0], "Group updated successfully");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to update group");
  }
};

/* ===============================
   SOFT DELETE GROUP (user-initiated)
================================ */
exports.softDeleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;
    const { reason } = req.body;

    const group = await pool.query(
      `SELECT created_by FROM portal.study_groups WHERE group_id = $1 AND deleted_at IS NULL`,
      [id],
    );
    if (!group.rows.length)
      return errorResponse(res, "Group not found or already deleted", 404);
    if (group.rows[0].created_by !== userId)
      return errorResponse(res, "Only the owner can delete this group", 403);

    // Soft delete: mark with deletion timestamp, user, and reason
    const result = await pool.query(
      `UPDATE portal.study_groups 
       SET deleted_at = NOW(), deleted_by = $1, deletion_reason = $2
       WHERE group_id = $3
       RETURNING group_id, name, deleted_at`,
      [userId, reason || "No reason provided", id],
    );

    return successResponse(res, result.rows[0], "Group deleted successfully");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to delete group");
  }
};
