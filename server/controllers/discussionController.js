const pool = require("../config/db");
const discussionService = require("../services/discussionService");
const profanityService = require("../services/profanityService");
const { feed } = require("../utils/activityService");
const { successResponse, errorResponse } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");

/**
 * Process raw tag input (mix of IDs and names) into an array of numeric tag IDs.
 * Extracted to avoid duplicating this logic in create/update.
 */
async function processTagInput(tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return [];

  const numericIds = tags.filter((t) => typeof t === "number");
  const stringNames = tags.filter(
    (t) => typeof t === "string" && isNaN(Number(t)),
  );
  const numericStrings = tags
    .filter((t) => typeof t === "string" && !isNaN(Number(t)))
    .map(Number);

  let convertedIds = [];
  if (stringNames.length > 0) {
    convertedIds = await discussionService.getOrCreateTags(stringNames);
  }

  return [...numericIds, ...numericStrings, ...convertedIds];
}

/* ===============================
    GET ALL DISCUSSIONS (with filters)
  ================================ */
exports.getAllDiscussions = catchAsync(async (req, res) => {
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
});

/* ===============================
    GET TRENDING DISCUSSIONS
  ================================ */
exports.getTrendingDiscussions = catchAsync(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const trending = await discussionService.getTrendingDiscussions(limit);
    res.json(trending);
});

/* ===============================
    GET USER'S DEFAULT FILTERS
  ================================ */
exports.getUserDefaults = catchAsync(async (req, res) => {
    const userId = req.user.portal_user_id;
    const defaults = await discussionService.getUserFilterDefaults(userId);
    res.json(defaults || {});
});

/* ===============================
    GET ALL TAGS
  ================================ */
exports.getAllTags = catchAsync(async (req, res) => {
    const tags = await discussionService.getAllTags();
    res.json(tags || []);
});

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

exports.getSpecializations = catchAsync(async (req, res) => {
    res.json(SPECIALIZATIONS);
});

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

exports.getDegrees = catchAsync(async (req, res) => {
    res.json(DEGREES);
});

/* ===============================
    DISCUSSION DETAILS
  ================================ */
exports.getDiscussionDetails = catchAsync(async (req, res) => {
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
});

/* ===============================
    CREATE DISCUSSION
  ================================ */
exports.createDiscussion = catchAsync(async (req, res) => {
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

    // Non-blocking feed event for discovery surfaces.
    try {
      await feed({
        actorId: userId,
        actionType: "discussion_created",
        referenceType: "discussion",
        referenceId: discussion.discussion_id,
        metadata: { title: discussion.title },
      });
    } catch (feedErr) {
      console.error(
        "Discussion feed event failed (non-fatal):",
        feedErr.message,
      );
    }

    res.status(201).json(discussion);
});

/* ===============================
    UPDATE DISCUSSION (24h limit)
  ================================ */
exports.updateDiscussion = catchAsync(async (req, res) => {
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
});

/* ===============================
    DELETE DISCUSSION (soft delete)
  ================================ */
exports.deleteDiscussion = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.portal_user_id;
    const isAdmin = req.user.role === "admin";

    await discussionService.deleteDiscussion(id, userId, isAdmin);
    return successResponse(res, null, "Discussion deleted successfully");
});

/* ===============================
    HARD DELETE DISCUSSION (permanent)
   =============================== */
exports.hardDeleteDiscussion = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    await discussionService.hardDeleteDiscussion(id, userId);
    return successResponse(res, null, "Discussion permanently deleted");
});

/* ===============================
    ADD COMMENT
  ================================ */
exports.addComment = catchAsync(async (req, res) => {
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
});

/* ===============================
    DELETE COMMENT
  ================================ */
exports.deleteComment = catchAsync(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.portal_user_id;
    const isAdmin = req.user.role === "admin";

    await discussionService.deleteComment(commentId, userId, isAdmin);
    return successResponse(res, null, "Comment deleted successfully");
});

/* ===============================
    SOFT DELETE COMMENT (user-initiated)
    — records deletion + reason for moderation
  ================================ */
exports.softDeleteComment = catchAsync(async (req, res) => {
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
    if (Number(comment.rows[0].user_id) !== Number(userId)) {
      return errorResponse(res, "Only the author can delete this comment", 403);
    }

    // Soft delete: mark with deletion timestamp, user, and reason
    const result = await pool.query(
      `UPDATE portal.discussion_comments 
       SET deleted_at = NOW(), deleted_by = $1, deletion_reason = $2
       WHERE comment_id = $3
       RETURNING comment_id, discussion_id, content, deleted_at`,
      [userId, reason || "No reason provided", commentId],
    );

    // Decrement the comment count for the discussion
    if (result.rows.length > 0) {
      await pool.query(
        `UPDATE portal.discussions SET comment_count = GREATEST(0, comment_count - 1) WHERE discussion_id = $1`,
        [result.rows[0].discussion_id],
      );
    }

    return successResponse(
      res,
      result.rows[0],
      "Comment deleted successfully (soft delete)",
    );
});

/* ===============================
    TOGGLE LIKE
  ================================ */
exports.toggleLike = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.portal_user_id;

    // Validate inputs
    if (!id || !userId) {
      return errorResponse(
        res,
        "Invalid request - missing discussion ID or user",
        400,
      );
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
});

/* ===============================
    TOGGLE SAVE
  ================================ */
exports.toggleSave = catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    const result = await discussionService.toggleSave(id, userId);
    res.json(result);
});

/* ===============================
    GET SAVED DISCUSSIONS
  ================================ */
exports.getSavedDiscussions = catchAsync(async (req, res) => {
    const userId = req.user.portal_user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await discussionService.getSavedDiscussions(
      userId,
      page,
      limit,
    );
    res.json(result);
});

/* ===============================
    GET MY POSTS
  ================================ */
exports.getMyPosts = catchAsync(async (req, res) => {
    const userId = req.user.portal_user_id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await discussionService.getMyPosts(userId, page, limit);
    res.json(result);
});

/* ===============================
    BOOST DISCUSSION
  ================================ */
exports.boostDiscussion = catchAsync(async (req, res) => {
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

    return successResponse(
      res,
      boostedDiscussion,
      "Discussion boosted successfully!",
    );
});

/* ===============================
    UPLOAD IMAGE (Standalone)
   =============================== */
exports.uploadImage = catchAsync(async (req, res) => {
    if (!req.file) {
      return errorResponse(res, "No image file provided", 400);
    }

    return successResponse(res, {
      image_url: req.file.path,
      image_public_id: req.file.filename,
    });
});
