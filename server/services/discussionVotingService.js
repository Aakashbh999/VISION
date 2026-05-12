const pool = require("../config/db");
const XPService = require("./xpService");
const { withTransaction } = require("../utils/withTransaction");

const toInt = (value, label) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
  return parsed;
};

const handleDiscussionVote = async (discussionId, userId, voteType) => {
  const discId = toInt(discussionId, "discussionId");
  const uId = toInt(userId, "userId");

  return withTransaction(async (client) => {
    const authorRes = await client.query(
      "SELECT user_id FROM portal.discussions WHERE discussion_id = $1",
      [discId],
    );
    const authorId = authorRes.rows[0]?.user_id;

    const existingRes = await client.query(
      `SELECT vote_type FROM portal.discussion_likes WHERE discussion_id = $1 AND user_id = $2`,
      [discId, uId],
    );
    const oldVoteType =
      existingRes.rows.length > 0 ? existingRes.rows[0].vote_type : 0;
    const newVoteType = oldVoteType === voteType ? 0 : voteType;

    if (oldVoteType === 0 && newVoteType !== 0) {
      await client.query(
        `INSERT INTO portal.discussion_likes (discussion_id, user_id, vote_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (discussion_id, user_id)
         DO UPDATE SET vote_type = EXCLUDED.vote_type`,
        [discId, uId, newVoteType],
      );
    } else if (newVoteType === 0) {
      await client.query(
        `DELETE FROM portal.discussion_likes WHERE discussion_id = $1 AND user_id = $2`,
        [discId, uId],
      );
    } else {
      await client.query(
        `UPDATE portal.discussion_likes SET vote_type = $1 WHERE discussion_id = $2 AND user_id = $3`,
        [newVoteType, discId, uId],
      );
    }

    await client.query(
      `UPDATE portal.discussions
       SET like_count = (
         SELECT COUNT(*)
         FROM portal.discussion_likes
         WHERE discussion_id = $1 AND vote_type = 1
       )
       WHERE discussion_id = $1`,
      [discId],
    );

    if (authorId && authorId !== uId) {
      if (newVoteType === 1 && oldVoteType !== 1) {
        await XPService.updateUserXP(
          authorId,
          5,
          "Received a Discussion Upvote",
          client,
        );
      } else if (oldVoteType === 1 && newVoteType !== 1) {
        await XPService.updateUserXP(
          authorId,
          -5,
          "Discussion Upvote Removed",
          client,
        );
      }
    }

    return {
      voteType: newVoteType,
      scoreDiff: newVoteType - oldVoteType,
      authorId,
    };
  });
};

const handleCommentVote = async (commentId, userId, voteType) => {
  const commId = toInt(commentId, "commentId");
  const uId = toInt(userId, "userId");

  return withTransaction(async (client) => {
    const authorRes = await client.query(
      "SELECT user_id FROM portal.discussion_comments WHERE comment_id = $1",
      [commId],
    );
    const authorId = authorRes.rows[0]?.user_id;

    const isSelfVote = authorId && Number(authorId) === Number(uId);

    const existingRes = await client.query(
      `SELECT vote_type FROM portal.comment_likes WHERE comment_id = $1 AND user_id = $2`,
      [commId, uId],
    );
    const oldVoteType =
      existingRes.rows.length > 0 ? existingRes.rows[0].vote_type : 0;
    const newVoteType = oldVoteType === voteType ? 0 : voteType;

    if (oldVoteType === 0 && newVoteType !== 0) {
      await client.query(
        `INSERT INTO portal.comment_likes (comment_id, user_id, vote_type) VALUES ($1, $2, $3)`,
        [commId, uId, newVoteType],
      );
    } else if (newVoteType === 0) {
      await client.query(
        `DELETE FROM portal.comment_likes WHERE comment_id = $1 AND user_id = $2`,
        [commId, uId],
      );
    } else {
      await client.query(
        `UPDATE portal.comment_likes SET vote_type = $1 WHERE comment_id = $2 AND user_id = $3`,
        [newVoteType, commId, uId],
      );
    }

    await client.query(
      `UPDATE portal.discussion_comments
       SET likes_count = (
         SELECT COUNT(*)
         FROM portal.comment_likes
         WHERE comment_id = $1 AND vote_type = 1
       )
       WHERE comment_id = $1`,
      [commId],
    );

    if (authorId && !isSelfVote) {
      if (newVoteType === 1 && oldVoteType !== 1) {
        await XPService.updateUserXP(
          authorId,
          2,
          "Comment received an Upvote",
          client,
        );
      } else if (oldVoteType === 1 && newVoteType !== 1) {
        await XPService.updateUserXP(
          authorId,
          -2,
          "Comment Upvote Removed",
          client,
        );
      }
    }

    return {
      voteType: newVoteType,
      scoreDiff: newVoteType - oldVoteType,
      authorId,
    };
  });
};

module.exports = {
  handleDiscussionVote,
  handleCommentVote,
};
