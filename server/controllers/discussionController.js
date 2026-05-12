/**
 * Discussion Controller
 * Manages discussion forum operations including creation, filtering, trending discussions, and tag management.
 * Integrates with profanity filtering and recommendation engine for enhanced content discovery.
 *
 * Features:
 * - Discussions listing with multi-dimensional filtering (specialization, degree, program, tags, search)
 * - Trending discussions ranking by engagement metrics
 * - Dynamic tagging with system/custom tag support
 * - Auto-search fallback with recommendations when no results found
 * - User preference persistence for default filters
 * - Profanity content validation
 */

const pool = require("../config/db");
const discussionService = require("../services/discussionService");
const profanityService = require("../services/profanityService");
const { feed } = require("../utils/activityService");
const { successResponse, errorResponse } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");

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

/**
 * Get all discussions with optional filtering and search
 * Returns paginated discussions with tags, supports multi-dimensional filtering
 * Falls back to recommendations if search yields no results
 *
 * @async
 * @param {Object} req - Express request
 * @param {string} [req.query.specialization] - Filter by specialization (web-development, etc.)
 * @param {string} [req.query.degree] - Filter by academic degree
 * @param {string} [req.query.jobRole] - Filter by job role
 * @param {string} [req.query.program] - Filter by academic program
 * @param {string} [req.query.tag] - Filter by tag ID or name
 * @param {string} [req.query.search] - Full-text search query
 * @param {string} [req.query.sort] - Sort order (latest, trending, top) - default: latest
 * @param {string} [req.query.page] - Page number for pagination
 * @param {string} [req.query.limit] - Items per page
 * @param {Object} res - Express response
 * @returns {Object} - { discussions: [], pagination: {}, tags: [], recommendations?: [] }
 */
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

/**
 * Get trending discussions ranked by engagement metrics
 * Returns top discussions by like count, comment count, and recency
 *
 * @async
 * @param {Object} req - Express request
 * @param {string} [req.query.limit] - Number of trending items (default: 10)
 * @param {Object} res - Express response
 * @returns {Array} - Sorted array of trending discussion objects
 */
exports.getTrendingDiscussions = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const trending = await discussionService.getTrendingDiscussions(limit);
  res.json(trending);
});

/**
 * Get user's saved discussion filter preferences
 * Retrieves default filters (specialization, degree, etc.) for personalized browsing
 *
 * @async
 * @param {Object} req - Express request (requires auth)
 * @param {Object} req.user - { portal_user_id }
 * @param {Object} res - Express response
 * @returns {Object} - User's default filter preferences or empty object
 */
exports.getUserDefaults = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;
  const defaults = await discussionService.getUserFilterDefaults(userId);
  res.json(defaults || {});
});

/**
 * Get all available discussion tags
 * Returns system tags and/or custom tags for filtering and categorization
 *
 * @async
 * @param {Object} req - Express request
 * @param {string} [req.query.type] - Filter by type: 'system' or 'custom'
 * @param {Object} res - Express response
 * @returns {Array} - Array of tag objects { tag_id, name, tag_type }
 */
exports.getAllTags = catchAsync(async (req, res) => {
  const { type } = req.query;
  const validType = type === "system" || type === "custom" ? type : null;
  const tags = await discussionService.getAllTags(validType);
  res.json(tags || []);
});

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

/**
 * Get all discussion specializations
 * Returns predefined list of IT specialization categories
 *
 * @async
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Array} - Array of specialization objects { id, name, slug }
 */
exports.getSpecializations = catchAsync(async (req, res) => {
  res.json(SPECIALIZATIONS);
});

/**
 * Get all academic degrees
 * Returns degree codes for program/discussion filtering
 *
 * @async
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Array} - Array of degree objects { id, code, name }
 */
exports.getDegrees = catchAsync(async (req, res) => {
  const result = await pool.query(
    "SELECT id, degree_code as code, degree_code as name FROM portal.academic_degrees ORDER BY id ASC",
  );
  res.json(result.rows);
});

/**
 * Get all academic programs
 * Returns programs available in the platform
 *
 * @async
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Array} - Array of program objects { id, name }
 */
exports.getPrograms = catchAsync(async (req, res) => {
  const result = await pool.query(
    "SELECT program_id as id, program_name as name FROM portal.programs ORDER BY program_id ASC",
  );
  res.json(result.rows);
});

/**
 * Get discussion details with comments
 * Fetches single discussion and all associated comments with optional sorting
 *
 * @async
 * @param {Object} req - Express request
 * @param {string} req.params.id - Discussion ID
 * @param {string} [req.query.sort] - Comment sort order (latest, top, oldest)
 * @param {Object} res - Express response
 * @returns {Object} - { discussion: {}, comments: [] }
 * @throws {Error} - 404 if discussion not found
 */
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

/**
 * Create new discussion
 * Posts new discussion topic with tags, profanity filtering, and activity logging
 *
 * @async
 * @param {Object} req - Express request (requires auth)
 * @param {Object} req.user - { portal_user_id }
 * @param {Object} req.validatedBody - {
 *   title: string - Discussion title
 *   content: string - Discussion body (min 10 chars)
 *   tags: number[] - Tag IDs or names
 *   degree_id?: number
 *   program_id?: number
 *   career_scope?: string
 * }
 * @param {Object} res - Express response
 * @returns {Object} - Created discussion object with ID
 * @throws {Error} - 400 if content fails profanity check or validation
 */
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
    system_tags,
    custom_tags,
    imageUrl,
    imagePublicId,
    imageCaption,
  } = req.body;

  programId = programId || req.user.program_id;
  degreeId = degreeId || req.user.academic_degree_id;

  if (!title) {
    return errorResponse(res, "Title is required", 400);
  }
  if (!specializationId) {
    return errorResponse(res, "Specialization is required", 400);
  }

  content = content || "";

  title = profanityService.cleanText(title);
  content = profanityService.cleanText(content);

  let tagIds = [];
  if (system_tags !== undefined || custom_tags !== undefined) {
    const systemIds = (Array.isArray(system_tags) ? system_tags : [])
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0);
    const customNames = (Array.isArray(custom_tags) ? custom_tags : [])
      .map(String)
      .filter(Boolean);

    if (systemIds.length > 5) {
      return errorResponse(res, "Maximum 5 system tags allowed.", 400);
    }
    if (customNames.length > 2) {
      return errorResponse(res, "Maximum 2 custom tags allowed.", 400);
    }

    const customIds =
      customNames.length > 0
        ? await discussionService.getOrCreateTags(customNames)
        : [];
    tagIds = [...systemIds, ...customIds];
  } else {
    tagIds = await processTagInput(tags);
  }

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

  try {
    await feed({
      actorId: userId,
      actionType: "discussion_created",
      referenceType: "discussion",
      referenceId: discussion.discussion_id,
      metadata: { title: discussion.title },
    });
  } catch (feedErr) {
    logger.warn({ err: feedErr }, "Discussion feed event failed");
  }

  res.status(201).json(discussion);
});

exports.updateDiscussion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;
  const isAdmin = req.user.role === "admin";
  let {
    title,
    content,
    specializationId,
    degreeId,
    jobRoleId,
    tags,
    system_tags,
    custom_tags,
  } = req.body;

  if (title) title = profanityService.cleanText(title);
  if (content) content = profanityService.cleanText(content);

  let tagIds = null;
  if (system_tags !== undefined || custom_tags !== undefined) {
    const systemIds = (Array.isArray(system_tags) ? system_tags : [])
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0);
    const customNames = (Array.isArray(custom_tags) ? custom_tags : [])
      .map(String)
      .filter(Boolean);

    if (systemIds.length > 5) {
      return errorResponse(res, "Maximum 5 system tags allowed.", 400);
    }
    if (customNames.length > 2) {
      return errorResponse(res, "Maximum 2 custom tags allowed.", 400);
    }

    const customIds =
      customNames.length > 0
        ? await discussionService.getOrCreateTags(customNames)
        : [];
    tagIds = [...systemIds, ...customIds];
  } else if (tags && Array.isArray(tags)) {
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

exports.deleteDiscussion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;
  const isAdmin = req.user.role === "admin";

  await discussionService.deleteDiscussion(id, userId, isAdmin);
  return successResponse(res, null, "Discussion deleted successfully");
});

exports.hardDeleteDiscussion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;

  await discussionService.hardDeleteDiscussion(id, userId);
  return successResponse(res, null, "Discussion permanently deleted");
});

exports.addComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  let { content, parentId, website } = req.body;
  const userId = req.user.portal_user_id;

  if (parentId === undefined) parentId = null;

  if (website) {
    return successResponse(res, null, "Comment added successfully");
  }

  if (typeof content !== "string" || !content.trim()) {
    return errorResponse(res, "Content is required", 400);
  }

  content = profanityService.cleanText(content);

  const comment = await discussionService.addComment(
    id,
    userId,
    content,
    parentId,
  );

  const discussion = await discussionService.getDiscussionById(id);
  if (discussion && discussion.author_id !== userId) {
    await discussionService.createNotification(
      discussion.author_id,
      "comment",
      `commented on your post "${discussion.title}"`,
      userId,
      comment.comment_id,
      "comment",
    );
  }

  res.status(201).json(comment);
});

exports.deleteComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.portal_user_id;
  const isAdmin = req.user.role === "admin";

  await discussionService.deleteComment(commentId, userId, isAdmin);
  return successResponse(res, null, "Comment deleted successfully");
});

exports.softDeleteComment = catchAsync(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.portal_user_id;
  const { reason } = req.body;

  const comment = await pool.query(
    `SELECT user_id FROM portal.discussion_comments
       WHERE comment_id = $1 AND deleted_at IS NULL`,
    [commentId],
  );

  if (!comment.rows.length) {
    return errorResponse(res, "Comment not found or already deleted", 404);
  }

  if (Number(comment.rows[0].user_id) !== Number(userId)) {
    return errorResponse(res, "Only the author can delete this comment", 403);
  }

  const result = await pool.query(
    `UPDATE portal.discussion_comments
       SET deleted_at = NOW(), deleted_by = $1, deletion_reason = $2
       WHERE comment_id = $3
       RETURNING comment_id, discussion_id, content, deleted_at`,
    [userId, reason || "No reason provided", commentId],
  );

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

exports.toggleLike = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.portal_user_id;

  if (!id || !userId) {
    return errorResponse(
      res,
      "Invalid request - missing discussion ID or user",
      400,
    );
  }

  const result = await discussionService.toggleLike(id, userId);

  if (result.liked) {
    try {
      const discussion = await discussionService.getDiscussionById(id);
      if (discussion && discussion.author_id !== userId) {
        await discussionService.createNotification(
          discussion.author_id,
          "like",
          `liked your post "${discussion.title}"`,
          userId,
          id,
          "discussion",
        );
      }
    } catch (notifErr) {
      logger.warn({ err: notifErr }, "Failed to send like notification");
    }
  }

  res.json(result);
});

exports.toggleSave = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;

  const result = await discussionService.toggleSave(id, userId);
  res.json(result);
});

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

exports.getMyPosts = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await discussionService.getMyPosts(userId, page, limit);
  res.json(result);
});

exports.boostDiscussion = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;

  if (!id) {
    return errorResponse(res, "Discussion ID is required", 400);
  }

  const boostedDiscussion = await discussionService.boostDiscussion(id, userId);

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

exports.uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, "No image file provided", 400);
  }

  return successResponse(res, {
    image_url: req.file.path,
    image_public_id: req.file.filename,
  });
});
