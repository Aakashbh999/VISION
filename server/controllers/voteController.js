const discussionService = require("../services/discussionService");
const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");
const logger = require("../utils/logger");

/**
 * Vote Controller
 * Handles upvoting and downvoting with XP gain for authors.
 */

exports.handleVote = catchAsync(async (req, res) => {
  const { id } = req.params; // discussion_id
  let { vote_type } = req.body; // 1, -1, or 0 (clear vote)
  const userId = req.user.portal_user_id;

  // Convert vote_type to number if string
  vote_type = Number(vote_type);

  if (![1, -1, 0].includes(vote_type)) {
    throw createError(400, "Invalid vote type. Use 1, -1, or 0.");
  }

  const result = await discussionService.handleVote(id, userId, vote_type);

  // Send notification for new upvote
  if (result.voteType === 1 && result.authorId && result.authorId !== userId) {
    try {
      const discussion = await discussionService.getDiscussionById(id);
      if (discussion) {
        await discussionService.createNotification(
          result.authorId,
          "like",
          `Someone upvoted your discussion "${discussion.title}"`,
          userId,
          id,
          "discussion",
        );
      }
    } catch (notifErr) {
      logger.warn({ err: notifErr }, "Failed to send upvote notification");
    }
  }

  res.json(result);
});

exports.handleCommentVote = catchAsync(async (req, res) => {
  const { id } = req.params; // comment_id
  let { vote_type } = req.body; // 1, -1, or 0 (clear vote)
  const userId = req.user.portal_user_id;

  // Convert vote_type to number if string
  vote_type = Number(vote_type);

  if (![1, -1, 0].includes(vote_type)) {
    throw createError(400, "Invalid vote type. Use 1, -1, or 0.");
  }

  const result = await discussionService.handleCommentVote(
    id,
    userId,
    vote_type,
  );

  // Send notification for comment upvote
  if (result.voteType === 1 && result.authorId && result.authorId !== userId) {
    try {
      // For comment notifications, we point to the parent discussion
      const commentRes = await pool.query(
        "SELECT discussion_id, content FROM portal.discussion_comments WHERE comment_id = $1",
        [id],
      );
      if (commentRes.rows.length > 0) {
        const { discussion_id, content } = commentRes.rows[0];
        const preview =
          content.length > 30 ? content.substring(0, 30) + "..." : content;
        await discussionService.createNotification(
          result.authorId,
          "comment_like",
          `Someone upvoted your comment: "${preview}"`,
          userId,
          discussion_id,
          "discussion",
        );
      }
    } catch (notifErr) {
      logger.warn(
        { err: notifErr },
        "Failed to send comment upvote notification",
      );
    }
  }

  res.json(result);
});
