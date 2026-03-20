const pool = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");
const {
  getMembership,
  hasGroupPermission,
} = require("../utils/groupPermissions");

/* ===============================
   GET GROUP POSTS (with pagination)
================================ */
exports.getPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 30, before, section = "general" } = req.query;
    const messageLimit = Math.min(parseInt(limit) || 30, 100);

    let query = `
      SELECT gp.post_id, gp.user_id, gp.content, gp.created_at, gp.section,
             u.full_name, u.profile_image
      FROM portal.group_posts gp
      JOIN portal.users u ON u.user_id = gp.user_id
      WHERE gp.group_id = $1 AND gp.section = $2 AND gp.deleted_at IS NULL
    `;
    const params = [id, section];

    if (before) {
      params.push(before);
      query += ` AND gp.post_id < $${params.length}`;
    }

    query += ` ORDER BY gp.created_at DESC LIMIT $${params.length + 1}`;
    params.push(messageLimit + 1);

    const posts = await pool.query(query, params);
    const hasMoreItems = posts.rows.length > messageLimit;
    const finalMessages = hasMoreItems
      ? posts.rows.slice(0, messageLimit)
      : posts.rows;

    return successResponse(res, {
      messages: finalMessages,
      hasMore: hasMoreItems,
      oldestId:
        finalMessages.length > 0
          ? finalMessages[finalMessages.length - 1].post_id
          : null,
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch posts");
  }
};

/* ===============================
   CREATE POST
================================ */
exports.createPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, section = "general" } = req.body;
    const userId = req.user.portal_user_id;

    const allowedSections = [
      "notice_board",
      "discussion",
      "qa",
      "resources",
      "general",
    ];
    if (!allowedSections.includes(section)) {
      return errorResponse(res, "Invalid section", 400);
    }

    // Notice board: only owner or co-admin with official voice permission can post
    if (section === "notice_board") {
      const membership = await getMembership(id, userId);
      if (!hasGroupPermission(membership, "post_notice")) {
        return errorResponse(
          res,
          "Only approved officials can post to the Notice Board.",
          403,
        );
      }
    }

    const result = await pool.query(
      `INSERT INTO portal.group_posts (group_id, user_id, content, section) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, userId, content, section],
    );

    return successResponse(res, result.rows[0], "Post created successfully");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create post");
  }
};

/* ===============================
   SOFT DELETE POST (user-initiated)
   — records deletion + reason for moderation
================================ */
exports.softDeletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.portal_user_id;
    const { reason } = req.body;

    // Verify post exists and is not already deleted
    const post = await pool.query(
      `SELECT user_id, group_id FROM portal.group_posts WHERE post_id = $1 AND deleted_at IS NULL`,
      [postId],
    );

    if (!post.rows.length) {
      return errorResponse(res, "Post not found or already deleted", 404);
    }

    const membership = await getMembership(post.rows[0].group_id, userId);

    if (
      post.rows[0].user_id !== userId &&
      !hasGroupPermission(membership, "moderate_content")
    ) {
      return errorResponse(res, "You cannot delete this post", 403);
    }

    // Soft delete: mark with deletion timestamp, user, and reason
    const result = await pool.query(
      `UPDATE portal.group_posts 
       SET deleted_at = NOW(), deleted_by = $1, deletion_reason = $2
       WHERE post_id = $3
       RETURNING post_id, content, deleted_at`,
      [userId, reason || "No reason provided", postId],
    );

    return successResponse(
      res,
      result.rows[0],
      "Post deleted successfully (soft delete)",
    );
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to delete post");
  }
};
