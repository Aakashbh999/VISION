/**
 * Group Membership Controller
 * Manages group member lifecycle: joining, invitations, requests, and role management.
 * Handles permission-based access control and co-admin role assignments.
 *
 * Features:
 * - Group member listing with role and permission information
 * - Public group joining (instant membership)
 * - Restricted group join requests (admin approval required)
 * - Join request approval/rejection
 * - Group invitations with acceptance workflow
 * - Co-admin role assignment with permission templates
 * - Member removal and role updates
 * - Co-admin capacity limiting (MAX_CO_ADMINS = 5)
 */

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

  if (parseInt(member_count) >= parseInt(capacity)) {
    return errorResponse(res, "This group is at full capacity", 400);
  }

  if (privacy_type === "private") {
    if (!invite || invite !== invite_token) {
      return errorResponse(res, "Invalid invite link", 403);
    }
  } else if (privacy_type === "request") {
    return errorResponse(
      res,
      "This group requires a join request. Use POST /request-join instead.",
      400,
    );
  }

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

exports.requestToJoin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;

  const group = await pool.query(
    `SELECT privacy_type FROM portal.study_groups WHERE group_id = $1`,
    [id],
  );
  if (!group.rows.length) return errorResponse(res, "Group not found", 404);

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

exports.inviteMember = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { userId: receiverId } = req.body;
  const senderId = req.user.portal_user_id;

  if (!receiverId) return errorResponse(res, "User ID is required", 400);

  const membership = await getMembership(id, senderId);
  if (!hasGroupPermission(membership, "manage_users")) {
    return errorResponse(res, "Unauthorized", 403);
  }

  const existing = await pool.query(
    `SELECT 1 FROM portal.group_members WHERE group_id = $1 AND user_id = $2`,
    [id, receiverId],
  );
  if (existing.rows.length) {
    return errorResponse(res, "User is already a member", 400);
  }

  const pending = await pool.query(
    `SELECT 1 FROM portal.group_invitations
     WHERE group_id = $1 AND receiver_id = $2 AND status = 'pending' AND expires_at > NOW()`,
    [id, receiverId],
  );
  if (pending.rows.length) {
    return errorResponse(res, "Invitation already pending", 400);
  }

  const group = await pool.query(
    `SELECT name FROM portal.study_groups WHERE group_id = $1`,
    [id],
  );
  const groupName = group.rows[0]?.name || "a circle";

  const invitation = await pool.query(
    `INSERT INTO portal.group_invitations (group_id, sender_id, receiver_id)
     VALUES ($1, $2, $3) RETURNING invitation_id`,
    [id, senderId, receiverId],
  );

  const invitationId = invitation.rows[0].invitation_id;

  const { notify } = require("../utils/activityService");
  await notify({
    userId: receiverId,
    actorId: senderId,
    type: "group_invite",
    title: "Circle Invitation",
    message: `You've been invited to join the circle: ${groupName}. This invite expires in 24 hours.`,
    relatedType: "group_invite",
    relatedId: invitationId,
  });

  return successResponse(res, { invitationId }, "Invitation sent successfully");
});

exports.acceptInvitation = catchAsync(async (req, res) => {
  const { invitationId } = req.params;
  const userId = req.user.portal_user_id;

  const invitation = await pool.query(
    `SELECT i.*, g.name AS group_name
     FROM portal.group_invitations i
     JOIN portal.study_groups g ON g.group_id = i.group_id
     WHERE i.invitation_id = $1 AND i.receiver_id = $2 AND i.status = 'pending'`,
    [invitationId, userId],
  );

  if (!invitation.rows.length) {
    return errorResponse(res, "Invitation not found or already processed", 404);
  }

  if (new Date(invitation.rows[0].expires_at) < new Date()) {
    await pool.query(
      `UPDATE portal.group_invitations SET status = 'expired' WHERE invitation_id = $1`,
      [invitationId],
    );
    return errorResponse(res, "This invitation has expired", 410);
  }

  const { group_id, sender_id, group_name } = invitation.rows[0];

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO portal.group_members (group_id, user_id, role, status)
       VALUES ($1, $2, 'member', 'approved') ON CONFLICT DO NOTHING`,
      [group_id, userId],
    );

    await client.query(
      `UPDATE portal.group_invitations SET status = 'accepted' WHERE invitation_id = $1`,
      [invitationId],
    );

    await client.query(
      `UPDATE portal.notifications SET is_read = TRUE
       WHERE type = 'group_invite' AND related_id = $1 AND user_id = $2`,
      [invitationId, userId],
    );
  });

  const { notify, feed } = require("../utils/activityService");
  await notify({
    userId: sender_id,
    actorId: userId,
    type: "invite_accepted",
    title: "Invitation Accepted",
    message: `A student has accepted your invitation to join ${group_name}.`,
    relatedType: "group",
    relatedId: group_id,
  });

  await feed({
    actorId: userId,
    actionType: "group_joined",
    referenceType: "group",
    referenceId: group_id,
    metadata: { group_id, group_name, invite_id: invitationId },
  });

  return successResponse(res, { joined: true }, "You have joined the circle!");
});

exports.rejectInvitation = catchAsync(async (req, res) => {
  const { invitationId } = req.params;
  const userId = req.user.portal_user_id;

  const invitation = await pool.query(
    `SELECT i.*, g.name AS group_name
     FROM portal.group_invitations i
     JOIN portal.study_groups g ON g.group_id = i.group_id
     WHERE i.invitation_id = $1 AND i.receiver_id = $2 AND i.status = 'pending'`,
    [invitationId, userId],
  );

  if (!invitation.rows.length) {
    return errorResponse(res, "Invitation not found", 404);
  }

  const { sender_id, group_name, group_id } = invitation.rows[0];

  await pool.query(
    `UPDATE portal.group_invitations SET status = 'rejected' WHERE invitation_id = $1`,
    [invitationId],
  );

  const { notify } = require("../utils/activityService");
  await notify({
    userId: sender_id,
    actorId: userId,
    type: "invite_rejected",
    title: "Invitation Declined",
    message: `A student has declined your invitation to join ${group_name}.`,
    relatedType: "group",
    relatedId: group_id,
  });

  return successResponse(res, { rejected: true }, "Invitation declined");
});

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

exports.removeMember = catchAsync(async (req, res) => {
  const { id, memberId } = req.params;
  const adminId = req.user.portal_user_id;

  if (String(memberId) === String(adminId)) {
    return errorResponse(
      res,
      "You cannot remove yourself. Use Leave Group instead.",
      400,
    );
  }

  const membership = await getMembership(id, adminId);
  if (!hasGroupPermission(membership, "manage_users")) {
    return errorResponse(res, "Unauthorized", 403);
  }

  const target = await pool.query(
    `SELECT role FROM portal.group_members WHERE group_id = $1 AND user_id = $2`,
    [id, memberId],
  );

  if (!target.rows.length) {
    return errorResponse(res, "Member not found", 404);
  }

  const targetRole = target.rows[0].role;

  if (targetRole === "owner") {
    return errorResponse(
      res,
      "The owner cannot be removed from the group",
      403,
    );
  }

  if (membership.role === "moderator" && targetRole !== "member") {
    return errorResponse(
      res,
      "Moderators can only remove regular members",
      403,
    );
  }

  await pool.query(
    `DELETE FROM portal.group_members WHERE group_id = $1 AND user_id = $2`,
    [id, memberId],
  );

  const { notify } = require("../utils/activityService");
  const group = await pool.query(
    `SELECT name FROM portal.study_groups WHERE group_id = $1`,
    [id],
  );
  await notify({
    userId: memberId,
    actorId: adminId,
    type: "group_removed",
    title: "Removed from Circle",
    message: `You have been removed from the circle: ${group.rows[0]?.name || "a group"}.`,
    relatedType: "group",
    relatedId: id,
  });

  return successResponse(res, null, "Member removed successfully");
});

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
