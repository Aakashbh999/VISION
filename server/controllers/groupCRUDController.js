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
const catchAsync = require("../utils/catchAsync");

/* ===============================
   GET MANAGED GROUPS (Owner / Co-Admin)
================================ */
exports.getManagedGroups = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;

  const query = `
      SELECT 
        g.group_id,
        g.name,
        g.description,
        g.created_at,
        g.group_image,
        g.privacy_type,
        g.capacity,
        COUNT(DISTINCT mem.user_id) AS members_count,
        gm.role AS my_role
      FROM portal.study_groups g
      JOIN portal.group_members gm ON gm.group_id = g.group_id
      LEFT JOIN portal.group_members mem ON mem.group_id = g.group_id AND (mem.status = 'approved' OR mem.role = 'owner')
      WHERE gm.user_id = $1 
        AND gm.role IN ('owner', 'co_admin')
        AND g.deleted_at IS NULL
      GROUP BY g.group_id, gm.role
      ORDER BY g.created_at DESC
    `;

  const result = await pool.query(query, [userId]);
  res.json(result.rows);
});

/* ===============================
   GET ALL GROUPS
================================ */
exports.getGroups = catchAsync(async (req, res) => {
  const { search, sort, degree, program } = req.query;
  const userId = req.user?.portal_user_id;
  
  // ... (caching headers)

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
        g.program_id,
        ad.degree_code AS degree_name,
        p.program_name,
        u.full_name AS creator,
        COUNT(DISTINCT gm.user_id) AS members,
        ${userId ? `EXISTS(SELECT 1 FROM portal.group_members WHERE group_id = g.group_id AND user_id = $1) AS is_member` : "FALSE AS is_member"},
        ${userId ? `(SELECT role FROM portal.group_members WHERE group_id = g.group_id AND user_id = $1 LIMIT 1) AS member_role` : "NULL AS member_role"},
        (SELECT MAX(gp.created_at) FROM portal.group_posts gp WHERE gp.group_id = g.group_id) AS last_activity
      FROM portal.study_groups g
      JOIN portal.users u ON u.user_id = g.created_by
      LEFT JOIN portal.group_members gm ON gm.group_id = g.group_id AND gm.status = 'approved'
      LEFT JOIN portal.academic_degrees ad ON ad.id = g.degree_id
      LEFT JOIN portal.programs p ON p.program_id = g.program_id
    `;

  const params = userId ? [userId] : [];
  let paramIndex = params.length;
  const conditions = ["g.deleted_at IS NULL"];

  // Filter by program (with bridging logic)
  if (program) {
    paramIndex++;
    const pId = parseInt(program);
    params.push(pId);
    if (pId >= 1 && pId <= 5) {
      conditions.push(`(g.program_id = $${paramIndex} OR g.degree_id = $${paramIndex})`);
    } else {
      conditions.push(`g.program_id = $${paramIndex}`);
    }
  } else if (degree) {
    paramIndex++;
    const dId = parseInt(degree);
    params.push(dId);
    if (dId >= 1 && dId <= 5) {
      conditions.push(`(g.degree_id = $${paramIndex} OR g.program_id = $${paramIndex})`);
    } else {
      conditions.push(`g.degree_id = $${paramIndex}`);
    }
  }

  // Filter by joined groups if requested
  if (sort === "joined" && userId) {
    conditions.push(
      `EXISTS(SELECT 1 FROM portal.group_members WHERE group_id = g.group_id AND user_id = $1 AND (status = 'approved' OR role = 'owner'))`,
    );
  }

  let searchParamIndex = null;
  if (search) {
    paramIndex++;
    searchParamIndex = paramIndex;
    conditions.push(
      `(g.name ILIKE $${paramIndex} OR g.description ILIKE $${paramIndex})`,
    );
    params.push(`%${search}%`);
  }

  query += ` WHERE ${conditions.join(" AND ")}`;
  query += ` GROUP BY g.group_id, g.name, g.description, g.created_at, g.group_image, g.banner_image, g.is_public, g.privacy_type, g.capacity, g.created_by, g.degree_id, g.program_id, ad.degree_code, p.program_name, u.full_name`;

  if (searchParamIndex && (!sort || sort === "latest")) {
    query += ` ORDER BY CASE WHEN g.name ILIKE $${searchParamIndex} THEN 0 WHEN g.description ILIKE $${searchParamIndex} THEN 1 ELSE 2 END, g.created_at DESC`;
  } else if (sort === "popular") {
    query += ` ORDER BY members DESC, g.created_at DESC`;
  } else if (sort === "recommended" && userId) {
    // Prioritize groups matching the user's degree, combined with popularity
    query += ` ORDER BY 
        (CASE WHEN g.degree_id = (SELECT academic_degree_id FROM portal.users WHERE user_id = $1) THEN 50 ELSE 0 END) +
        COUNT(DISTINCT gm.user_id) DESC, 
        g.created_at DESC`;
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
});

/* ===============================
   GROUP DETAILS
================================ */
exports.getGroupDetails = catchAsync(async (req, res) => {
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
});

/* ===============================
   CREATE GROUP
================================ */
exports.createGroup = catchAsync(async (req, res) => {
  const {
    name,
    description,
    privacy_type = "public",
    tags,
    system_tags,
    custom_tags,
    degree_id,
    program_id,
  } = req.body;
  const userId = req.user.portal_user_id;

  const finalDegreeId = degree_id || req.user.academic_degree_id || null;
  const finalProgramId = program_id || req.user.program_id || null;

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

  if (Array.isArray(system_tags) && system_tags.map(Number).filter((n) => Number.isInteger(n) && n > 0).length > 5) {
    return errorResponse(res, "Maximum 5 system tags allowed.", 400);
  }
  if (Array.isArray(custom_tags) && custom_tags.length > 2) {
    return errorResponse(res, "Maximum 2 custom tags allowed.", 400);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Process system and custom tags
    let rawTags = [];
    if (Array.isArray(system_tags) && system_tags.length > 0) {
      const tagIds = system_tags.map(Number).filter((n) => Number.isInteger(n) && n > 0);
      if (tagIds.length > 0) {
        const sysTagsQuery = await client.query("SELECT name FROM portal.tags WHERE tag_id = ANY($1::int[])", [tagIds]);
        rawTags.push(...sysTagsQuery.rows.map(r => r.name));
      }
    }
    
    if (Array.isArray(custom_tags)) {
      rawTags.push(...custom_tags);
    }
    
    if (Array.isArray(tags)) {
      rawTags.push(...tags);
    }

    // Normalize tags: clean, lowercase, deduplicate
    let normalizedTags = null;
    if (rawTags.length > 0) {
      normalizedTags = [
        ...new Set(
          rawTags
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

    const group = await client.query(
      `INSERT INTO portal.study_groups (name, description, created_by, degree_id, program_id, privacy_type, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
      [
        name.trim(),
        description || null,
        userId,
        finalDegreeId,
        finalProgramId,
        privacy_type,
        normalizedTags,
      ],
    );

    await client.query(
      `INSERT INTO portal.group_members (group_id, user_id, role, status) VALUES ($1, $2, 'owner', 'approved') ON CONFLICT DO NOTHING`,
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
});

/* ===============================
   UPDATE GROUP (name/description/privacy)
================================ */
exports.updateGroup = catchAsync(async (req, res) => {
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
});

/* ===============================
   SOFT DELETE GROUP (user-initiated)
================================ */
exports.softDeleteGroup = catchAsync(async (req, res) => {
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
});
