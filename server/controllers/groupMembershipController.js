const pool = require("../config/db");
const XPService = require("../services/xpService");
const { feed } = require("../utils/activityService");
const { successResponse, errorResponse } = require("../utils/response");
const {
  VXP_EXPAND_COST,
  MAX_CAPACITY,
  MAX_CO_ADMINS,
  EMPTY_GROUP_PERMISSIONS,
  DEFAULT_CO_ADMIN_PERMISSIONS,
} = require("../utils/constants");
const {
  getMembership,
  hasGroupPermission,
  normalizePermissions,
} = require("../utils/groupPermissions");
const { buildPresenceSelect } = require("../utils/presence");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");
const { withTransaction } = require("../utils/withTransaction");

/* ===============================
   GET GROUP MEMBERS
 ================================ */
exports.getGroupMembers = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { limit } = req.query;

  let query = `SELECT 
        u.user_id, u.full_name, u.profile_image,
        ${buildPresenceSelect("u")},
        gm.joined_at, gm.role, gm.permissions
      FROM portal.group_members gm
      JOIN portal.users u ON u.user_id = gm.user_id
      WHERE gm.group_id = $1
      ORDER BY 
        CASE gm.role WHEN 'owner' THEN 0 WHEN 'co_admin' THEN 1 ELSE 2 END,
        gm.joined_at ASC`;

  const params = [id];

  // Add limit if specified
  if (limit) {
    query += ` LIMIT $2`;
    params.push(parseInt(limit));
  }

  const members = await pool.query(query, params);

  return successResponse(
    res,
    members.rows.map((member) => ({
      ...member,
      permissions: normalizePermissions(member.role, member.permissions),
    })),
  );
});

/* ===============================
   JOIN GROUP (privacy-aware)
 ================================ */
exports.joinGroup = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { invite } = req.query;
  const userId = req.user.portal_user_id;

  const group = await pool.query(
    `SELECT privacy_type, capacity, invite_token,
        (SELECT COUNT(*) FROM portal.group_members WHERE group_id = $1 AND status = 'approved') AS member_count
       FROM portal.study_groups WHERE group_id = $1`,
    [id],
  );
  if (!group.rows.length) return errorResponse(res, "Group not found", 404);

  const { privacy_type, capacity, invite_token, member_count } = group.rows[0];

  // Check capacity
  if (parseInt(member_count) >= parseInt(capacity)) {
    return errorResponse(res, "This group is at full capacity", 400);
  }

  if (privacy_type === "private") {
    if (!invite || invite !== invite_token) {
      return errorResponse(res, "Invalid invite link", 403);
    }
  } else if (privacy_type === "request") {
    // Redirect to request-to-join flow
    return errorResponse(
      res,
      "This group requires a join request. Use POST /request-join instead.",
      400,
    );
  }

  // Public or valid private invite — direct join
  await pool.query(
    `INSERT INTO portal.group_members (group_id, user_id, role, status) VALUES ($1, $2, 'member', 'approved') ON CONFLICT DO NOTHING`,
    [id, userId],
  );

  try {
    await feed({
      actorId: userId,
      actionType: "group_joined",
      referenceType: "group",
      referenceId: Number(id),
      metadata: { group_id: Number(id) },
    });
  } catch (feedErr) {
    logger.warn({ err: feedErr }, "Group join feed event failed");
  }

  return successResponse(res, { joined: true }, "Joined group successfully");
});

/* ===============================
   REQUEST TO JOIN (for request-type groups)
 ================================ */
exports.requestToJoin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;

  const group = await pool.query(
    `SELECT privacy_type FROM portal.study_groups WHERE group_id = $1`,
    [id],
  );
  if (!group.rows.length) return errorResponse(res, "Group not found", 404);

  // Check already a member
  const existing = await pool.query(
    `SELECT 1 FROM portal.group_members WHERE group_id = $1 AND user_id = $2`,
    [id, userId],
  );
  if (existing.rows.length)
    return errorResponse(res, "Already a member of this group", 400);

  await pool.query(
    `INSERT INTO portal.join_requests (group_id, user_id) VALUES ($1, $2)
       ON CONFLICT (group_id, user_id) DO NOTHING`,
    [id, userId],
  );

  return successResponse(res, { requested: true }, "Join request submitted");
});

/* ===============================
   GET JOIN REQUESTS (admin/co-admin only)
 ================================ */
exports.getJoinRequests = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;

  const membership = await getMembership(id, userId);
  if (!hasGroupPermission(membership, "manage_users")) {
    return errorResponse(res, "Unauthorized", 403);
  }

  const requests = await pool.query(
    `SELECT jr.request_id, jr.user_id, jr.requested_at, u.full_name, u.profile_image
       FROM portal.join_requests jr
       JOIN portal.users u ON u.user_id = jr.user_id
       WHERE jr.group_id = $1 AND jr.status = 'pending'
       ORDER BY jr.requested_at ASC`,
    [id],
  );

  return successResponse(res, requests.rows);
});

/* ===============================
   APPROVE JOIN REQUEST
 ================================ */
exports.approveRequest = catchAsync(async (req, res) => {
  const { id, requestId } = req.params;
  const userId = req.user.portal_user_id;

  const membership = await getMembership(id, userId);
  if (!hasGroupPermission(membership, "manage_users")) {
    return errorResponse(res, "Unauthorized", 403);
  }

  const request = await pool.query(
    `SELECT user_id FROM portal.join_requests WHERE request_id = $1 AND group_id = $2 AND status = 'pending'`,
    [requestId, id],
  );
  if (!request.rows.length) return errorResponse(res, "Request not found", 404);

  // Check capacity
  const cap = await pool.query(
    `SELECT capacity, (SELECT COUNT(*) FROM portal.group_members WHERE group_id = $1 AND status = 'approved') AS member_count
       FROM portal.study_groups WHERE group_id = $1`,
    [id],
  );
  if (parseInt(cap.rows[0].member_count) >= parseInt(cap.rows[0].capacity)) {
    return errorResponse(res, "Group is at full capacity", 400);
  }

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO portal.group_members (group_id, user_id, role, status) VALUES ($1, $2, 'member', 'approved') ON CONFLICT DO NOTHING`,
      [id, request.rows[0].user_id],
    );
    await client.query(
      `UPDATE portal.join_requests SET status = 'approved' WHERE request_id = $1`,
      [requestId],
    );
  });

  try {
    await feed({
      actorId: request.rows[0].user_id,
      actionType: "group_join_approved",
      referenceType: "group",
      referenceId: Number(id),
      metadata: {
        group_id: Number(id),
        approved_by: userId,
      },
    });
  } catch (feedErr) {
    logger.warn({ err: feedErr }, "Group approval feed event failed");
  }

  return successResponse(res, null, "Join request approved");
});

/* ===============================
   DECLINE JOIN REQUEST
 ================================ */
exports.declineRequest = catchAsync(async (req, res) => {
  const { id, requestId } = req.params;
  const userId = req.user.portal_user_id;

  const membership = await getMembership(id, userId);
  if (!hasGroupPermission(membership, "manage_users")) {
    return errorResponse(res, "Unauthorized", 403);
  }

  await pool.query(
    `UPDATE portal.join_requests SET status = 'declined' WHERE request_id = $1 AND group_id = $2`,
    [requestId, id],
  );

  return successResponse(res, null, "Join request declined");
});

/* ===============================
   APPOINT CO-ADMIN (owner only)
 ================================ */
exports.appointCoAdmin = catchAsync(async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.portal_user_id;

  const ownerCheck = await pool.query(
    `SELECT role FROM portal.group_members WHERE group_id = $1 AND user_id = $2`,
    [id, userId],
  );
  if (!ownerCheck.rows.length || ownerCheck.rows[0].role !== "owner") {
    return errorResponse(
      res,
      "Only the Labyrinth Master can appoint Co-Admins",
      403,
    );
  }

  // Check co-admin limit
  const coAdminCount = await pool.query(
    `SELECT COUNT(*) FROM portal.group_members WHERE group_id = $1 AND role = 'co_admin' AND status = 'approved'`,
    [id],
  );
  if (parseInt(coAdminCount.rows[0].count) >= MAX_CO_ADMINS) {
    return errorResponse(
      res,
      `Maximum ${MAX_CO_ADMINS} Co-Admins allowed (Council of Five)`,
      400,
    );
  }

  await pool.query(
    `UPDATE portal.group_members
       SET role = 'co_admin',
           permissions = $3::jsonb
       WHERE group_id = $1 AND user_id = $2 AND role = 'member'`,
    [id, memberId, JSON.stringify(DEFAULT_CO_ADMIN_PERMISSIONS)],
  );

  return successResponse(res, null, "Co-Admin appointed successfully");
});

/* ===============================
   UPDATE CO-ADMIN PERMISSIONS (owner only)
 ================================ */
exports.updateCoAdminPermissions = catchAsync(async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.portal_user_id;
  const ownerCheck = await pool.query(
    `SELECT role FROM portal.group_members WHERE group_id = $1 AND user_id = $2`,
    [id, userId],
  );

  if (!ownerCheck.rows.length || ownerCheck.rows[0].role !== "owner") {
    return errorResponse(res, "Only the owner can update permissions", 403);
  }

  const target = await pool.query(
    `SELECT role, permissions FROM portal.group_members WHERE group_id = $1 AND user_id = $2`,
    [id, memberId],
  );

  if (!target.rows.length || target.rows[0].role !== "co_admin") {
    return errorResponse(res, "Target member is not a co-admin", 400);
  }

  const requestedPermissions =
    req.body && typeof req.body.permissions === "object"
      ? req.body.permissions
      : req.body;

  const nextPermissions = normalizePermissions("co_admin", {
    ...target.rows[0].permissions,
    ...requestedPermissions,
  });

  const allowedKeys = Object.keys(EMPTY_GROUP_PERMISSIONS);
  for (const key of allowedKeys) {
    nextPermissions[key] = nextPermissions[key] === true;
  }

  const result = await pool.query(
    `UPDATE portal.group_members
       SET permissions = $3::jsonb
       WHERE group_id = $1 AND user_id = $2
       RETURNING role, permissions`,
    [id, memberId, JSON.stringify(nextPermissions)],
  );

  return successResponse(
    res,
    {
      role: result.rows[0].role,
      permissions: normalizePermissions(
        result.rows[0].role,
        result.rows[0].permissions,
      ),
    },
    "Permissions updated successfully",
  );
});

/* ===============================
   REMOVE CO-ADMIN (owner only)
 ================================ */
exports.removeCoAdmin = catchAsync(async (req, res) => {
  const { id, memberId } = req.params;
  const userId = req.user.portal_user_id;

  const ownerCheck = await pool.query(
    `SELECT role FROM portal.group_members WHERE group_id = $1 AND user_id = $2`,
    [id, userId],
  );
  if (!ownerCheck.rows.length || ownerCheck.rows[0].role !== "owner") {
    return errorResponse(res, "Only the owner can remove Co-Admins", 403);
  }

  await pool.query(
    `UPDATE portal.group_members
       SET role = 'member',
           permissions = $3::jsonb
       WHERE group_id = $1 AND user_id = $2 AND role = 'co_admin'`,
    [id, memberId, JSON.stringify(EMPTY_GROUP_PERMISSIONS)],
  );

  return successResponse(res, null, "Co-Admin role removed");
});

/* ===============================
   EXPAND CAPACITY (+2 slots via VXP)
 ================================ */
exports.expandCapacity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;

  const group = await pool.query(
    `SELECT created_by, capacity FROM portal.study_groups WHERE group_id = $1`,
    [id],
  );
  if (!group.rows.length) return errorResponse(res, "Group not found", 404);
  if (group.rows[0].created_by !== userId)
    return errorResponse(res, "Only the owner can expand capacity", 403);

  const currentCapacity = parseInt(group.rows[0].capacity);
  if (currentCapacity >= MAX_CAPACITY) {
    return errorResponse(
      res,
      `Maximum capacity of ${MAX_CAPACITY} already reached`,
      400,
    );
  }

  const newCapacity = await withTransaction(async (client) => {
    const stats = await XPService.getUserStats(userId);
    if (!stats || stats.total_xp < VXP_EXPAND_COST) {
      const error = new Error(`Need ${VXP_EXPAND_COST} VXP to expand capacity`);
      error.statusCode = 403;
      throw error;
    }

    await XPService.updateUserXP(
      userId,
      -VXP_EXPAND_COST,
      "Group capacity expansion",
      client,
    );

    const nextCapacity = Math.min(currentCapacity + 2, MAX_CAPACITY);
    await client.query(
      `UPDATE portal.study_groups SET capacity = $1 WHERE group_id = $2`,
      [nextCapacity, id],
    );
    return nextCapacity;
  });

  return successResponse(
    res,
    { capacity: newCapacity },
    `Capacity expanded to ${newCapacity} members`,
  );
});

/* ===============================
   LEAVE GROUP
 ================================ */
exports.leaveGroup = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;

  const group = await pool.query(
    `SELECT created_by FROM portal.study_groups WHERE group_id = $1`,
    [id],
  );
  if (group.rows[0]?.created_by === userId) {
    return errorResponse(
      res,
      "Owner cannot leave. Transfer ownership or delete the group.",
      400,
    );
  }

  await pool.query(
    `DELETE FROM portal.group_members WHERE group_id = $1 AND user_id = $2`,
    [id, userId],
  );
  return successResponse(res, { joined: false }, "Left group successfully");
});
