const pool = require("../config/db");
const { withTransaction } = require("../utils/withTransaction");

const addComment = async (discussionId, userId, content, parentId = null) =>
  withTransaction(async (client) => {
    const result = await client.query(
      `INSERT INTO portal.discussion_comments (discussion_id, user_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [discussionId, userId, content, parentId],
    );

    await client.query(
      `UPDATE portal.discussions SET comment_count = comment_count + 1 WHERE discussion_id = $1`,
      [discussionId],
    );

    return result.rows[0];
  });

const getComments = async (discussionId, currentUserId = null, sort = "newest") => {
  const dId = Number.parseInt(discussionId, 10);
  const params = [dId];
  let userVoteClause = "0";

  if (currentUserId) {
    userVoteClause = `COALESCE((SELECT vote_type FROM portal.comment_likes cl WHERE cl.comment_id = c.comment_id AND cl.user_id = $2), 0)`;
    params.push(Number.parseInt(currentUserId, 10));
  }

  const orderBy =
    sort === "top"
      ? "c.likes_count DESC, c.created_at DESC"
      : "c.created_at DESC";

  const result = await pool.query(
    `SELECT
      c.comment_id,
      c.content,
      c.created_at,
      c.parent_id,
      c.likes_count,
      ${userVoteClause} AS user_vote,
      u.user_id,
      u.full_name,
      u.profile_image
     FROM portal.discussion_comments c
     JOIN portal.users u ON u.user_id = c.user_id
     WHERE c.discussion_id = $1 AND c.deleted_at IS NULL AND c.is_deleted = FALSE AND u.status = 'active'
     ORDER BY ${orderBy}`,
    params,
  );
  return result.rows;
};

const deleteComment = async (commentId, userId, isAdmin = false) => {
  const checkResult = await pool.query(
    `SELECT c.user_id, c.discussion_id FROM portal.discussion_comments c WHERE c.comment_id = $1`,
    [commentId],
  );
  if (checkResult.rows.length === 0) {
    throw new Error("Comment not found");
  }

  const comment = checkResult.rows[0];
  if (isAdmin) {
    await pool.query(`DELETE FROM portal.discussion_comments WHERE comment_id = $1`, [
      commentId,
    ]);
  } else if (Number(comment.user_id) === Number(userId)) {
    await pool.query(
      `UPDATE portal.discussion_comments SET deleted_at = NOW() WHERE comment_id = $1`,
      [commentId],
    );
  } else {
    throw new Error("Not authorized to delete this comment");
  }

  await pool.query(
    `UPDATE portal.discussions SET comment_count = GREATEST(0, comment_count - 1) WHERE discussion_id = $1`,
    [comment.discussion_id],
  );
  return true;
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
};
