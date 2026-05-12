/**
 * Study Group Controller (Legacy)
 * Simple study group operations for basic group functionality.
 * Note: Primary group features are in groupCRUDController and related group modules.
 *
 * Features:
 * - Group creation
 * - Group joining
 * - Group leaving
 * - Member listing
 * - Post creation within groups
 * - Post retrieval from groups
 *
 * Status: Legacy implementation (newer groupCRUDController + group membership/post controllers recommended)
 */

const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

exports.createGroup = catchAsync(async (req, res) => {
  const { name, description, max_members = 8 } = req.body;

  const portalUserId = req.user.portal_user_id;

  if (!portalUserId) {
    throw createError(401, "User not found");
  }

  const groupRes = await pool.query(
    `INSERT INTO portal.groups (name, description, owner_id, max_members, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
    [name, description, portalUserId, max_members],
  );

  const group = groupRes.rows[0];

  await pool.query(
    `INSERT INTO portal.group_members (group_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
    [group.group_id, portalUserId],
  );

  res.json({ message: "Study group created", group });
});

exports.joinGroup = catchAsync(async (req, res) => {
  const { groupId } = req.params;

  const portalUserId = req.user.portal_user_id;

  if (!portalUserId) {
    throw createError(401, "User not found");
  }

  const capacity = await pool.query(
    `SELECT max_members,
              (SELECT COUNT(*) FROM portal.group_members WHERE group_id=$1) AS total
       FROM portal.groups WHERE group_id=$1`,
    [groupId],
  );

  if (capacity.rows.length === 0) {
    throw createError(404, "Group not found");
  }

  if (capacity.rows[0].total >= capacity.rows[0].max_members) {
    throw createError(409, "Group is full");
  }

  await pool.query(
    `INSERT INTO portal.group_members (group_id, user_id, role)
       VALUES ($1,$2,'member')
       ON CONFLICT DO NOTHING`,
    [groupId, portalUserId],
  );

  res.json({ message: "Joined group" });
});

exports.leaveGroup = catchAsync(async (req, res) => {
  const { groupId } = req.params;

  const portalUserId = req.user.portal_user_id;

  if (!portalUserId) {
    throw createError(401, "User not found");
  }

  await pool.query(
    `DELETE FROM portal.group_members WHERE group_id=$1 AND user_id=$2`,
    [groupId, portalUserId],
  );

  res.json({ message: "Left group" });
});

exports.getMembers = catchAsync(async (req, res) => {
  const { groupId } = req.params;

  const members = await pool.query(
    `SELECT u.user_id, u.full_name, gm.role
       FROM portal.group_members gm
       JOIN portal.users u ON u.user_id = gm.user_id
       WHERE gm.group_id = $1`,
    [groupId],
  );

  res.json(members.rows);
});

exports.createPost = catchAsync(async (req, res) => {
  const { groupId } = req.params;
  const { content } = req.body;

  const portalUserId = req.user.portal_user_id;

  if (!portalUserId) {
    throw createError(401, "User not found");
  }

  const post = await pool.query(
    `INSERT INTO portal.group_posts (group_id, user_id, content, created_at)
       VALUES ($1,$2,$3,NOW())
       RETURNING *`,
    [groupId, portalUserId, content],
  );

  res.json(post.rows[0]);
});

exports.getPosts = catchAsync(async (req, res) => {
  const { groupId } = req.params;

  const posts = await pool.query(
    `SELECT gp.post_id, gp.content, gp.created_at, u.full_name
       FROM portal.group_posts gp
       JOIN portal.users u ON u.user_id = gp.user_id
       WHERE gp.group_id = $1
       ORDER BY gp.created_at ASC`,
    [groupId],
  );

  res.json(posts.rows);
});
