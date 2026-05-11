const pool = require("../config/db");
const { feed } = require("../utils/activityService");
const { successResponse, errorResponse } = require("../utils/response");
const {
  getMembership,
  hasGroupPermission,
} = require("../utils/groupPermissions");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");

const QA_ANSWER_EDIT_WINDOW_MINUTES = 30;

const isGroupAdmin = (groupOwnerId, membership, userId) =>
  groupOwnerId === userId ||
  membership?.role === "owner" ||
  membership?.role === "co_admin" ||
  hasGroupPermission(membership, "manage_users") ||
  hasGroupPermission(membership, "moderate_content");

exports.getPosts = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { limit = 30, before, after, section = "general" } = req.query;
  const messageLimit = Math.min(parseInt(limit) || 30, 100);

  let query = `
      SELECT gp.post_id, gp.user_id, gp.content, gp.created_at, gp.section,
             gp.qa_post_type, gp.qa_question_post_id,
             gp.file_url, gp.file_name, gp.file_type,
             gp.deleted_at,
             (gp.deleted_at IS NOT NULL) AS is_deleted,
             u.full_name, u.profile_image
      FROM portal.group_posts gp
      JOIN portal.users u ON u.user_id = gp.user_id
      WHERE gp.group_id = $1
        AND gp.section = $2
        AND (
          gp.deleted_at IS NULL
          OR (
            gp.section IN ('general', 'discussion')
            AND gp.deleted_at >= NOW() - INTERVAL '24 hours'
          )
        )
    `;
  const params = [id, section];

  if (after) {
    params.push(after);
    query += ` AND gp.post_id > $${params.length}`;
    query += ` ORDER BY gp.post_id ASC`;

    const posts = await pool.query(query, params);

    const finalMessages = posts.rows.reverse();

    return successResponse(res, {
      messages: finalMessages,
      hasMore: false,
      oldestId: null,
      latestId: finalMessages.length > 0 ? finalMessages[0].post_id : null,
    });
  } else {
    if (before) {
      params.push(before);
      query += ` AND gp.post_id < $${params.length}`;
    }

    query += ` ORDER BY gp.post_id DESC LIMIT $${params.length + 1}`;
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
      latestId:
        finalMessages.length > 0 && !before
          ? finalMessages[0].post_id
          : null,
    });
  }
});

exports.createPost = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    content,
    section = "general",
    qa_post_type = "question",
    qa_question_post_id,
  } = req.body;
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

  const groupResult = await pool.query(
    `SELECT created_by FROM portal.study_groups WHERE group_id = $1`,
    [id],
  );
  if (!groupResult.rows.length) {
    return errorResponse(res, "Group not found", 404);
  }

  const membership = await getMembership(id, userId);
  if (!membership) {
    return errorResponse(res, "Only group members can post.", 403);
  }
  const adminMode = isGroupAdmin(groupResult.rows[0].created_by, membership, userId);

  const normalizedContent = typeof content === "string" ? content.trim() : "";

  let normalizedQaType = null;
  let normalizedQaQuestionId = null;
  if (section === "qa") {
    normalizedQaType = qa_post_type === "answer" ? "answer" : "question";

    if (normalizedQaType === "question") {
      if (!normalizedContent) {
        return errorResponse(res, "Question text is required.", 400);
      }

      const recentQuestions = await pool.query(
        `SELECT COUNT(*) FROM portal.group_posts
         WHERE group_id = $1
           AND user_id = $2
           AND section = 'qa'
           AND qa_post_type = 'question'
           AND created_at >= NOW() - INTERVAL '7 days'
           AND deleted_at IS NULL`,
        [id, userId]
      );

      if (parseInt(recentQuestions.rows[0].count) >= 2) {
        return errorResponse(res, "You have reached the limit of 2 questions per week in this group.", 429);
      }
    }

    if (normalizedQaType === "answer") {
      if (!adminMode) {
        return errorResponse(
          res,
          "Only group admins and moderators can answer questions.",
          403,
        );
      }

      normalizedQaQuestionId = Number.parseInt(qa_question_post_id, 10);
      if (!Number.isInteger(normalizedQaQuestionId)) {
        return errorResponse(res, "A valid question ID is required for answers.", 400);
      }
      if (!normalizedContent) {
        return errorResponse(res, "Answer text is required.", 400);
      }

      const questionResult = await pool.query(
        `SELECT post_id FROM portal.group_posts
         WHERE post_id = $1
           AND group_id = $2
           AND section = 'qa'
           AND qa_post_type = 'question'
           AND deleted_at IS NULL`,
        [normalizedQaQuestionId, id],
      );
      if (!questionResult.rows.length) {
        return errorResponse(res, "Question not found.", 404);
      }

      const existingAnswer = await pool.query(
        `SELECT post_id FROM portal.group_posts
         WHERE qa_question_post_id = $1
           AND section = 'qa'
           AND qa_post_type = 'answer'
           AND deleted_at IS NULL`,
        [normalizedQaQuestionId],
      );
      if (existingAnswer.rows.length) {
        return errorResponse(res, "This question already has an answer.", 409);
      }
    }
  }

  let fileUrl = null;
  let filePublicId = null;
  let fileName = null;
  let fileType = null;
  if (section === "resources") {
    if (!adminMode) {
      return errorResponse(
        res,
        "Only group admins and moderators can upload resources to the vault.",
        403,
      );
    }

    if (!req.file) {
      return errorResponse(
        res,
        "Please upload an image or file (max 5MB) for the Resource Vault.",
        400,
      );
    }

    fileUrl = req.file.path || null;
    filePublicId = req.file.filename || null;
    fileName = req.file.originalname || req.file.filename || null;
    fileType = req.file.mimetype || null;
  }

  const result = await pool.query(
    `INSERT INTO portal.group_posts
      (group_id, user_id, content, section, qa_post_type, qa_question_post_id, file_url, file_public_id, file_name, file_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      id,
      userId,
      normalizedContent || null,
      section,
      normalizedQaType,
      normalizedQaQuestionId,
      fileUrl,
      filePublicId,
      fileName,
      fileType,
    ],
  );

  try {
    await feed({
      actorId: userId,
      actionType:
        section === "notice_board" ? "group_notice_posted" : "group_posted",
      referenceType: "group_post",
      referenceId: result.rows[0].post_id,
      metadata: {
        group_id: Number(id),
        section,
        title:
          section === "notice_board"
            ? "New notice published"
            : "New group post",
      },
    });
  } catch (feedErr) {
    logger.warn({ err: feedErr }, "Group post feed event failed");
  }

  return successResponse(res, result.rows[0], "Post created successfully");
});

exports.softDeletePost = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.portal_user_id;
  const { reason } = req.body;

  const post = await pool.query(
    `SELECT user_id, group_id, section FROM portal.group_posts WHERE post_id = $1 AND deleted_at IS NULL`,
    [postId],
  );

  if (!post.rows.length) {
    return errorResponse(res, "Post not found or already deleted", 404);
  }

  const membership = await getMembership(post.rows[0].group_id, userId);

  const groupMeta = await pool.query(
    `SELECT created_by FROM portal.study_groups WHERE group_id = $1`,
    [post.rows[0].group_id],
  );
  const adminMode = isGroupAdmin(
    groupMeta.rows[0]?.created_by,
    membership,
    userId,
  );

  const postSection = post.rows[0].section;
  if (postSection === "qa" || postSection === "resources") {
    if (!adminMode) {
      return errorResponse(
        res,
        "Only group admins can delete posts in Q&A and Resource Vault.",
        403,
      );
    }
  } else if (
    post.rows[0].user_id !== userId &&
    !hasGroupPermission(membership, "moderate_content")
  ) {
    return errorResponse(res, "You cannot delete this post", 403);
  }

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
});

exports.updateQaAnswer = catchAsync(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.portal_user_id;
  const { content } = req.body;

  const normalizedContent = typeof content === "string" ? content.trim() : "";
  if (!normalizedContent) {
    return errorResponse(res, "Answer content is required.", 400);
  }

  const answerResult = await pool.query(
    `SELECT gp.post_id, gp.group_id, gp.user_id, gp.created_at, gp.section, gp.qa_post_type
     FROM portal.group_posts gp
     WHERE gp.post_id = $1 AND gp.deleted_at IS NULL`,
    [postId],
  );

  if (!answerResult.rows.length) {
    return errorResponse(res, "Answer not found.", 404);
  }

  const answer = answerResult.rows[0];
  if (answer.section !== "qa" || answer.qa_post_type !== "answer") {
    return errorResponse(res, "Only Q&A answers can be edited here.", 400);
  }

  const membership = await getMembership(answer.group_id, userId);
  const groupMeta = await pool.query(
    `SELECT created_by FROM portal.study_groups WHERE group_id = $1`,
    [answer.group_id],
  );
  const adminMode = isGroupAdmin(groupMeta.rows[0]?.created_by, membership, userId);

  if (Number(answer.user_id) !== Number(userId) && !adminMode) {
    return errorResponse(res, "You cannot edit this answer.", 403);
  }

  const answerCreatedAt = new Date(answer.created_at).getTime();
  const minutesSinceCreation = (Date.now() - answerCreatedAt) / (1000 * 60);
  if (minutesSinceCreation > QA_ANSWER_EDIT_WINDOW_MINUTES) {
    return errorResponse(
      res,
      `Answer edit window expired (${QA_ANSWER_EDIT_WINDOW_MINUTES} minutes).`,
      403,
    );
  }

  const updated = await pool.query(
    `UPDATE portal.group_posts
     SET content = $1
     WHERE post_id = $2
     RETURNING *`,
    [normalizedContent, postId],
  );

  return successResponse(res, updated.rows[0], "Answer updated successfully.");
});
