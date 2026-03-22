const pool = require("../config/db");
const discussionService = require("../services/discussionService");
const profanityService = require("../services/profanityService");
const { feed } = require("../utils/activityService");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Process raw tag input (mix of IDs and names) into an array of numeric tag IDs.
 * Extracted to avoid duplicating this logic in create/update.
 */
async function processTagInput(tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return [];

  const numericIds = tags.filter((t) => typeof t === "number");
  const stringNames = tags.filter((t) => typeof t === "string" && isNaN(Number(t)));
  const numericStrings = tags.filter((t) => typeof t === "string" && !isNaN(Number(t))).map(Number);

  let convertedIds = [];
  if (stringNames.length > 0) {
    convertedIds = await discussionService.getOrCreateTags(stringNames);
  }

  return [...numericIds, ...numericStrings, ...convertedIds];
}

/* ===============================
    GET ALL DISCUSSIONS (with filters)
  ================================ */
exports.getAllDiscussions = async (req, res) => {
  try {
    const userId = req.user?.portal_user_id || null;
    const filters = {
      specialization: req.query.specialization,
      degree: req.query.degree,
      jobRole: req.query.jobRole,
      program: req.query.program,
      tag: req.query.tag,
      search: req.query.search,
      sort: req.query.sort || "latest",
      page: req.query.page,
      limit: req.query.limit,
    };

    const result = await discussionService.getDiscussions(filters, userId);

    // If searching and no results found, fetch recommendations
    if (filters.search && result.discussions.length === 0) {
      const { userSemester, userProgramId, userDegreeId } = req.user;
      const recommendationService = require("../services/recommendationService");
      const recommendations = await recommendationService.getRecommendations(
        userId,
        userSemester,
        userProgramId,
        userDegreeId,
        5,
      );
      return res.json({
        ...result,
        recommendations,
        noResults: true,
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch discussions");
  }
};

/* ===============================
    GET TRENDING DISCUSSIONS
  ================================ */
exports.getTrendingDiscussions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const trending = await discussionService.getTrendingDiscussions(limit);
    res.json(trending);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch trending discussions");
  }
};

/* ===============================
    GET USER'S DEFAULT FILTERS
  ================================ */
exports.getUserDefaults = async (req, res) => {
  try {
    const userId = req.user.portal_user_id;
    const defaults = await discussionService.getUserFilterDefaults(userId);
    res.json(defaults || {});
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch user defaults");
  }
};

/* ===============================
    GET ALL TAGS
  ================================ */
exports.getAllTags = async (req, res) => {
  try {
    const tags = await discussionService.getAllTags();
    res.json(tags || []);
  } catch (err) {
    console.error("Error fetching tags:", err.message);
    // Return empty array instead of error - table may not exist yet
    res.json([]);
  }
};

/* ===============================
    GET SPECIALIZATIONS (Static)
  ================================ */
const SPECIALIZATIONS = [
  { id: 1, name: "Web Development", slug: "web-development" },
  { id: 2, name: "Mobile App Development", slug: "mobile-app-development" },
  { id: 3, name: "Software Engineering", slug: "software-engineering" },
  { id: 4, name: "Cyber Security", slug: "cyber-security" },
  { id: 5, name: "Data Science", slug: "data-science" },
  { id: 6, name: "Cloud Computing", slug: "cloud-computing" },
  { id: 7, name: "AI & Machine Learning", slug: "ai-machine-learning" },
  { id: 8, name: "UI/UX Design", slug: "ui-ux-design" },
  { id: 9, name: "DevOps", slug: "devops" },
  { id: 10, name: "Database Management", slug: "database-management" },
  { id: 11, name: "Networking", slug: "networking" },
  { id: 12, name: "Game Development", slug: "game-development" },
];

exports.getSpecializations = (req, res) => {
  try {
    res.json(SPECIALIZATIONS);
  } catch (err) {
    console.error("Error in getSpecializations:", err);
    res.status(500).json({ error: "Failed to fetch specializations" });
  }
};

/* ===============================
    GET DEGREES (Static)
  ================================ */
const DEGREES = [
  { id: 1, code: "BSc.CSIT", name: "Bachelor of Science in CSIT" },
  { id: 2, code: "BCA", name: "Bachelor in Computer Applications" },
  { id: 3, code: "BIT", name: "Bachelor in Information Technology" },
  { id: 4, code: "BE Computer", name: "Bachelor of Engineering in Computer" },
  { id: 5, code: "BE Software", name: "Bachelor of Engineering in Software" },
  { id: 6, code: "BSc AI", name: "Bachelor of Science in AI" },
  {
    id: 7,
    code: "BSc Data Science",
    name: "Bachelor of Science in Data Science",
  },
  { id: 8, code: "BBA IT", name: "Bachelor of Business Administration in IT" },
  { id: 9, code: "BSc Multimedia", name: "Bachelor of Science in Multimedia" },
  { id: 10, code: "MCA", name: "Master of Computer Applications" },
  { id: 11, code: "MSc IT", name: "Master of Science in IT" },
  { id: 12, code: "MIT", name: "Master in Information Technology" },
];

exports.getDegrees = (req, res) => {
  try {
    res.json(DEGREES);
  } catch (err) {
    console.error("Error in getDegrees:", err);
    res.status(500).json({ error: "Failed to fetch degrees" });
  }
};

/* ===============================
    DISCUSSION DETAILS
  ================================ */
exports.getDiscussionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { sort } = req.query;
    const userId = req.user?.portal_user_id || null;

    const discussion = await discussionService.getDiscussionById(id, userId);

    if (!discussion) {
      return res.status(404).json({ error: "Discussion not found" });
    }

    const comments = await discussionService.getComments(id, userId, sort);

    res.json({
      discussion,
      comments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch discussion" });
  }
};

/* ===============================
    CREATE DISCUSSION
  ================================ */
exports.createDiscussion = async (req, res) => {
  try {
    const userId = req.user.portal_user_id;
    let {
      title,
      content,
      specializationId,
      degreeId,
      jobRoleId,
      programId,
      tags,
      imageUrl,
      imagePublicId,
      imageCaption,
    } = req.body;

    // Validate required fields
    if (!title) {
      return errorResponse(res, "Title is required", 400);
    }
    if (!specializationId) {
      return errorResponse(res, "Specialization is required", 400);
    }

    // Content is optional - default to empty string
    content = content || "";

    // Clean profanity (auto-clean mode)
    title = profanityService.cleanText(title);
    content = profanityService.cleanText(content);

    // Process tags using shared helper (DRY)
    const tagIds = await processTagInput(tags);

    const discussion = await discussionService.createDiscussion({
      userId,
      title,
      content,
      specializationId,
      degreeId,
      jobRoleId,
      programId,
      tags: tagIds,
      imageUrl,
      imagePublicId,
      imageCaption,
    });

    res.status(201).json(discussion);
  } catch (err) {
    console.error("Create discussion error:", err.message);
    return errorResponse(res, "Failed to create discussion");
  }
};

/* ===============================
    UPDATE DISCUSSION (24h limit)
  ================================ */
exports.updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;
    const isAdmin = req.user.role === "admin";
    let { title, content, specializationId, degreeId, jobRoleId, tags } =
      req.body;

    // Clean profanity if title/content provided
    if (title) title = profanityService.cleanText(title);
    if (content) content = profanityService.cleanText(content);

    // Process tags using shared helper (DRY)
    let tagIds = null;
    if (tags && Array.isArray(tags)) {
      tagIds = await processTagInput(tags);
    }

    const discussion = await discussionService.updateDiscussion(
      id,
      userId,
      { title, content, specializationId, degreeId, jobRoleId, tags: tagIds },
      isAdmin,
    );

    res.json(discussion);
  } catch (err) {
    console.error(err);
    if (err.message === "Edit window expired (24 hours)") {
      return errorResponse(res, err.message, 403);
    }
    if (err.message === "Not authorized to edit this discussion") {
      return errorResponse(res, err.message, 403);
    }
    if (err.message === "Discussion not found") {
      return errorResponse(res, err.message, 404);
    }
    return errorResponse(res, "Failed to update discussion");
  }
};

/* ===============================
    DELETE DISCUSSION (soft delete)
  ================================ */
exports.deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;
    const isAdmin = req.user.role === "admin";

    await discussionService.deleteDiscussion(id, userId, isAdmin);
    return successResponse(res, null, "Discussion deleted successfully");
  } catch (err) {
    console.error(err);
    if (err.message === "Not authorized to delete this discussion") {
      return errorResponse(res, err.message, 403);
    }
    if (err.message === "Discussion not found") {
      return errorResponse(res, err.message, 404);
    }
    return errorResponse(res, "Failed to delete discussion");
  }
};

/* ===============================
    HARD DELETE DISCUSSION (permanent)
   =============================== */
exports.hardDeleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    await discussionService.hardDeleteDiscussion(id, userId);
    return successResponse(res, null, "Discussion permanently deleted");
  } catch (err) {
    console.error(err);
    if (err.message === "Not authorized to hard delete this discussion") {
      return errorResponse(res, err.message, 403);
    }
    if (err.message === "Discussion not found") {
      return errorResponse(res, err.message, 404);
    }
    return errorResponse(res, "Failed to permanently delete discussion");
  }
};

/* ===============================
    ADD COMMENT
  ================================ */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    let { content, parentId, website } = req.body;
    const userId = req.user.portal_user_id;

    // Ensure parentId is null if not provided (undefined can cause 500 in PG)
    if (parentId === undefined) parentId = null;

    // Honeypot check
    if (website) {
      return successResponse(res, null, "Comment added successfully");
    }

    // Ensure content is a string
    if (typeof content !== "string" || !content.trim()) {
      return errorResponse(res, "Content is required", 400);
    }

    // Clean profanity
    content = profanityService.cleanText(content);

    const comment = await discussionService.addComment(
      id,
      userId,
      content,
      parentId,
    );

    // Get discussion owner for notification
    const discussion = await discussionService.getDiscussionById(id);
    if (discussion && discussion.author_id !== userId) {
      await discussionService.createNotification(
        discussion.author_id,
        "comment",
        `Someone commented on your discussion "${discussion.title}"`,
        userId,
        id,
        "discussion",
      );
    }

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to add comment");
  }
};

/* ===============================
    DELETE COMMENT
  ================================ */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.portal_user_id;
    const isAdmin = req.user.role === "admin";

    await discussionService.deleteComment(commentId, userId, isAdmin);
    return successResponse(res, null, "Comment deleted successfully");
  } catch (err) {
    console.error(err);
    if (err.message === "Not authorized to delete this comment") {
      return errorResponse(res, err.message, 403);
    }
    if (err.message === "Comment not found") {
      return errorResponse(res, err.message, 404);
    }
    return errorResponse(res, "Failed to delete comment");
  }
};

/* ===============================
    SOFT DELETE COMMENT (user-initiated)
    — records deletion + reason for moderation
  ================================ */
exports.softDeleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.portal_user_id;
    const { reason } = req.body;

    // Verify comment exists and is not already deleted
    const comment = await pool.query(
      `SELECT user_id FROM portal.discussion_comments 
       WHERE comment_id = $1 AND deleted_at IS NULL`,
      [commentId],
    );

    if (!comment.rows.length) {
      return errorResponse(res, "Comment not found or already deleted", 404);
    }

    // Only author can soft delete
    if (comment.rows[0].user_id !== userId) {
      return errorResponse(res, "Only the author can delete this comment", 403);
    }

    // Soft delete: mark with deletion timestamp, user, and reason
    const result = await pool.query(
      `UPDATE portal.discussion_comments 
       SET deleted_at = NOW(), deleted_by = $1, deletion_reason = $2
       WHERE comment_id = $3
       RETURNING comment_id, content, deleted_at`,
      [userId, reason || "No reason provided", commentId],
    );

    return successResponse(res, result.rows[0], "Comment deleted successfully (soft delete)");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to delete comment");
  }
};

/* ===============================
    TOGGLE LIKE
  ================================ */
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.portal_user_id;

    // Validate inputs
    if (!id || !userId) {
      return errorResponse(res, "Invalid request - missing discussion ID or user", 400);
    }

    const result = await discussionService.toggleLike(id, userId);

    // Send notification if liked (not unliked) - don't fail if notification fails
    if (result.liked) {
      try {
        const discussion = await discussionService.getDiscussionById(id);
        if (discussion && discussion.author_id !== userId) {
          await discussionService.createNotification(
            discussion.author_id,
            "like",
            `Someone liked your discussion "${discussion.title}"`,
            userId,
            id,
            "discussion",
          );
        }
      } catch (notifErr) {
        console.error("Failed to send like notification:", notifErr.message);
      }
    }

    res.json(result);
  } catch (err) {
    console.error("Toggle like error:", err.message);
    return errorResponse(res, "Like failed");
  }
};

/* ===============================
    TOGGLE SAVE
  ================================ */
exports.toggleSave = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    const result = await discussionService.toggleSave(id, userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    if (err.message && err.message.includes("Maximum")) {
      return errorResponse(res, err.message, 400);
    }
    return errorResponse(res, "Save failed");
  }
};

/* ===============================
    GET SAVED DISCUSSIONS
  ================================ */
exports.getSavedDiscussions = async (req, res) => {
  try {
    const userId = req.user.portal_user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await discussionService.getSavedDiscussions(
      userId,
      page,
      limit,
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch saved discussions");
  }
};

/* ===============================
    GET MY POSTS
  ================================ */
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.portal_user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await discussionService.getMyPosts(userId, page, limit);
    res.json(result);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to fetch your posts");
  }
};

/* ===============================
    BOOST DISCUSSION
  ================================ */
exports.boostDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    if (!id) {
      return errorResponse(res, "Discussion ID is required", 400);
    }

    const boostedDiscussion = await discussionService.boostDiscussion(
      id,
      userId,
    );

    // Log the boost action to activity feed
    await feed({
      actorId: userId,
      actionType: "boost",
      referenceType: "discussion",
      referenceId: id,
      metadata: { title: boostedDiscussion.title },
    });

    return successResponse(res, boostedDiscussion, "Discussion boosted successfully!");
  } catch (err) {
    console.error("Boost error:", err);
    if (
      err.message === "Insufficient reputation points (50 points required to boost)" ||
      err.message === "Discussion is already actively boosted"
    ) {
      return errorResponse(res, err.message, 400);
    }
    if (err.message === "Discussion not found") {
      return errorResponse(res, err.message, 404);
    }
    return errorResponse(res, "Failed to boost discussion");
  }
};

/* ===============================
    UPLOAD IMAGE (Standalone)
   =============================== */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, "No image file provided", 400);
    }

    return successResponse(res, {
      image_url: req.file.path,
      image_public_id: req.file.filename,
    });
  } catch (err) {
    console.error("Upload image error:", err);
    return errorResponse(res, "Failed to upload image");
  }
};
