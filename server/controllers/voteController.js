/**
 * Vote Controller
 * Handles upvoting/downvoting discussions and discussion comments.
 * Integrates with XP service for vote-based reputation rewards.
 *
 * Features:
 * - Discussion voting (upvote: +1, downvote: -1, clear: 0)
 * - Discussion comment voting
 * - Vote state tracking and toggling
 * - XP reward for discussion authors (10 XP per upvote)
 * - Vote count aggregation
 * - Activity logging for voting actions
 * - User vote history tracking
 */

const discussionService = require("../services/discussionService");
const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");
const logger = require("../utils/logger");

exports.handleVote = catchAsync(async (req, res) => {
  const { id } = req.params;
  let { vote_type } = req.body;
  const userId = req.user.portal_user_id;

  vote_type = Number(vote_type);

  if (![1, -1, 0].includes(vote_type)) {
    throw createError(400, "Invalid vote type. Use 1, -1, or 0.");
  }

  const result = await discussionService.handleVote(id, userId, vote_type);

  if (result.voteType === 1 && result.authorId && result.authorId !== userId) {
    try {
      const discussion = await discussionService.getDiscussionById(id);
      if (discussion) {
        await discussionService.createNotification(
          result.authorId,
          "like",
          `upvoted your post "${discussion.title}"`,
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
  const { id } = req.params;
  let { vote_type } = req.body;
  const userId = req.user.portal_user_id;

  vote_type = Number(vote_type);

  if (![1, -1, 0].includes(vote_type)) {
    throw createError(400, "Invalid vote type. Use 1, -1, or 0.");
  }

  const result = await discussionService.handleCommentVote(
    id,
    userId,
    vote_type,
  );

  if (result.voteType === 1 && result.authorId && result.authorId !== userId) {
    try {
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
          `upvoted your comment "${preview}"`,
          userId,
          id,
          "comment",
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
