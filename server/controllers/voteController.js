const discussionService = require("../services/discussionService");
const XPService = require("../services/xpService");

/**
 * Vote Controller
 * Handles upvoting and downvoting with XP gain for authors.
 */

exports.handleVote = async (req, res) => {
  try {
    const { id } = req.params; // discussion_id
    let { vote_type } = req.body; // 1 or -1
    const userId = req.user.portal_user_id;

    // Convert vote_type to number if string
    vote_type = Number(vote_type);

    if (![1, -1].includes(vote_type)) {
      return res.status(400).json({ error: "Invalid vote type. Use 1 or -1." });
    }

    const result = await discussionService.handleVote(id, userId, vote_type);

    res.json(result);
  } catch (err) {
    console.error("[Vote Controller Error]:", err);
    res.status(500).json({ error: "Failed to process vote" });
  }
};

exports.handleCommentVote = async (req, res) => {
  try {
    const { id } = req.params; // comment_id
    let { vote_type } = req.body; // 1 or -1
    const userId = req.user.portal_user_id;

    // Convert vote_type to number if string
    vote_type = Number(vote_type);

    if (![1, -1].includes(vote_type)) {
      return res.status(400).json({ error: "Invalid vote type. Use 1 or -1." });
    }

    const result = await discussionService.handleCommentVote(
      id,
      userId,
      vote_type,
    );

    res.json(result);
  } catch (err) {
    console.error("[Comment Vote Error]:", err);
    res.status(500).json({ error: "Failed to process comment vote" });
  }
};
