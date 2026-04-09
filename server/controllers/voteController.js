const discussionService = require("../services/discussionService");
const catchAsync = require("../utils/catchAsync");


/**
 * Vote Controller
 * Handles upvoting and downvoting with XP gain for authors.
 */

exports.handleVote = catchAsync(async (req, res) => {
    const { id } = req.params; // discussion_id
    let { vote_type } = req.body; // 1 or -1
    const userId = req.user.portal_user_id;

    // Convert vote_type to number if string
    vote_type = Number(vote_type);

    if (![1, -1].includes(vote_type)) {
      throw new Error("Invalid vote type. Use 1 or -1.");
    }

    const result = await discussionService.handleVote(id, userId, vote_type);

    res.json(result);
});

exports.handleCommentVote = catchAsync(async (req, res) => {
    const { id } = req.params; // comment_id
    let { vote_type } = req.body; // 1 or -1
    const userId = req.user.portal_user_id;

    // Convert vote_type to number if string
    vote_type = Number(vote_type);

    if (![1, -1].includes(vote_type)) {
      throw new Error("Invalid vote type. Use 1 or -1.");
    }

    const result = await discussionService.handleCommentVote(
      id,
      userId,
      vote_type,
    );

    res.json(result);
});
