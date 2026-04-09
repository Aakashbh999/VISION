/**
 * Discussion Service - Database Layer
 * Handles all SQL operations for the discussion system
 */

const pool = require("../config/db");
const XPService = require("./xpService");

/**
 * Build dynamic WHERE conditions for filtering
 * @param {Object} filters - Filter parameters
 * @returns {Object} - { whereClause, params, paramIndex }
 */
const buildFilterConditions = (filters, startParamIndex = 1) => {
  const conditions = ["d.deleted_at IS NULL", "d.is_deleted = FALSE"];
  const params = [];
  let paramIndex = startParamIndex;

  if (filters.specialization) {
    conditions.push(`d.specialization_id = $${paramIndex}`);
    params.push(parseInt(filters.specialization));
    paramIndex++;
  }

  if (filters.degree) {
    conditions.push(`d.degree_id = $${paramIndex}`);
    params.push(parseInt(filters.degree));
    paramIndex++;
  }

  if (filters.jobRole) {
    conditions.push(`d.job_role_id = $${paramIndex}`);
    params.push(parseInt(filters.jobRole));
    paramIndex++;
  }

  if (filters.program) {
    conditions.push(`d.program_id = $${paramIndex}`);
    params.push(parseInt(filters.program));
    paramIndex++;
  }

  if (filters.tag) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM portal.discussion_tags dt
        JOIN portal.tags t ON t.tag_id = dt.tag_id
        WHERE dt.discussion_id = d.discussion_id
        AND t.slug = $${paramIndex}
      )
    `);
    params.push(filters.tag);
    paramIndex++;
  }

  if (filters.search) {
    // Use trigram similarity operator (%) for fuzzy matching + ILIKE for prefix/exact matching
    conditions.push(
      `(d.title % $${paramIndex} OR d.content % $${paramIndex} OR d.title ILIKE $${paramIndex + 1} OR d.content ILIKE $${paramIndex + 1})`
    );
    params.push(filters.search);
    params.push(`%${filters.search}%`);
    paramIndex += 2;
  }

  if (filters.userId) {
    conditions.push(`d.user_id = $${paramIndex}`);
    params.push(parseInt(filters.userId));
    paramIndex++;
  }

  return {
    whereClause: conditions.join(" AND "),
    params,
    paramIndex,
  };
};

/**
 * Build ORDER BY clause based on sort parameter
 * Defaults to prioritizing active boosts
 * @param {string} sort - Sort option
 * @returns {string} - ORDER BY clause
 */
const buildSortClause = (sort, search = null, hasUserId = false) => {
  const boostPriority = `CASE WHEN d.is_boosted = TRUE AND d.boosted_until > NOW() THEN 0 ELSE 1 END ASC`;

  // If searching and no specific sort is requested, prioritize by similarity score
  if (search && (!sort || sort === "latest")) {
    return `ORDER BY ${boostPriority}, similarity(d.title, $1) DESC, d.created_at DESC`;
  }

  if (sort === "recommended" && hasUserId) {
    // Dynamic relevance score based on tags, degree, and engagement
    return `ORDER BY ${boostPriority}, relevance_score DESC, d.created_at DESC`;
  }

  switch (sort) {
    case "popular":
      return `ORDER BY ${boostPriority}, d.like_count DESC, d.created_at DESC`;
    case "discussed":
      return `ORDER BY ${boostPriority}, d.comment_count DESC, d.created_at DESC`;
    case "trending":
      return `ORDER BY ${boostPriority}, (d.like_count * 2 + d.comment_count) DESC, d.created_at DESC`;
    case "oldest":
      return "ORDER BY d.created_at ASC";
    default:
      return `ORDER BY ${boostPriority}, d.created_at DESC`;
  }
};

/**
 * Get all discussions with filters, sorting, and pagination
 */
exports.getDiscussions = async (filters = {}, currentUserId = null) => {
  const {
    whereClause,
    params,
    paramIndex: filterParamIndex,
  } = buildFilterConditions(filters);
  const sortClause = buildSortClause(filters.sort, filters.search, !!currentUserId);

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const offset = (page - 1) * limit;

  // Track param index for user-specific queries
  let paramIndex = filterParamIndex;
  let userLikedSavedClause = "";

  if (currentUserId) {
    // Use parameterized queries instead of string interpolation to prevent SQL injection
    userLikedSavedClause = `,
        EXISTS(
          SELECT 1 FROM portal.discussion_likes dl 
          WHERE dl.discussion_id = d.discussion_id AND dl.user_id = $${paramIndex} AND dl.vote_type = 1
        ) AS user_liked,
        EXISTS(
          SELECT 1 FROM portal.saved_discussions sd 
          WHERE sd.discussion_id = d.discussion_id AND sd.user_id = $${paramIndex}
        ) AS user_saved,
        COALESCE((
          SELECT vote_type FROM portal.discussion_likes dl
          WHERE dl.discussion_id = d.discussion_id AND dl.user_id = $${paramIndex}
        ), 0) AS user_vote,
        (
          (CASE WHEN d.degree_id = (SELECT academic_degree_id FROM portal.users WHERE user_id = $${paramIndex}) THEN 40 ELSE 0 END) +
          (CASE WHEN d.program_id = (SELECT program_id FROM portal.users WHERE user_id = $${paramIndex}) THEN 30 ELSE 0 END) +
          COALESCE((SELECT COUNT(*) * 10 FROM portal.discussion_tags dt JOIN portal.user_interests ui ON ui.tag_id = dt.tag_id WHERE dt.discussion_id = d.discussion_id AND ui.user_id = $${paramIndex}), 0) +
          (d.like_count * 2 + COALESCE((
            SELECT count(*)::int 
            FROM portal.discussion_comments c 
            JOIN portal.users cu ON cu.user_id = c.user_id 
            WHERE c.discussion_id = d.discussion_id 
              AND c.deleted_at IS NULL 
              AND c.is_deleted = FALSE 
              AND cu.status = 'active'
          ), 0) * 3)
        ) AS relevance_score
      `;
    params.push(parseInt(currentUserId));
    paramIndex++;
  }

  params.push(limit, offset);

  const query = `
    SELECT 
      d.discussion_id,
      d.title,
      d.content,
      d.created_at,
      d.updated_at,
      d.like_count,
      (
        SELECT count(*)::int 
        FROM portal.discussion_comments c 
        JOIN portal.users cu ON cu.user_id = c.user_id 
        WHERE c.discussion_id = d.discussion_id 
          AND c.deleted_at IS NULL 
          AND c.is_deleted = FALSE 
          AND cu.status = 'active'
      ) AS comment_count,
      d.image_url,
      d.image_caption,
      d.is_boosted,
      d.boosted_until,
      d.specialization_id,
      d.degree_id,
      d.job_role_id,
      d.program_id,
      u.user_id AS author_id,
      u.full_name AS author,
      u.profile_image AS author_avatar,
      f.field_name AS specialization_name,
      ad.full_name AS degree_name,
      jm.role_name AS job_role_name,
      p.program_name,
      COALESCE(
        (
          SELECT json_agg(json_build_object('tag_id', t.tag_id, 'name', t.name, 'slug', t.slug))
          FROM portal.discussion_tags dt
          JOIN portal.tags t ON t.tag_id = dt.tag_id
          WHERE dt.discussion_id = d.discussion_id
        ), '[]'
      ) AS tags
      ${userLikedSavedClause}
    FROM portal.discussions d
    JOIN portal.users u ON u.user_id = d.user_id
    LEFT JOIN portal.it_fields f ON f.id = d.specialization_id
    LEFT JOIN portal.academic_degrees ad ON ad.id = d.degree_id
    LEFT JOIN portal.job_market_insights jm ON jm.id = d.job_role_id
    LEFT JOIN portal.programs p ON p.program_id = d.program_id
    WHERE ${whereClause} AND u.status = 'active'
    ${sortClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM portal.discussions d
    JOIN portal.users u ON u.user_id = d.user_id
    WHERE ${whereClause} AND u.status = 'active'
  `;

  // For count query, exclude limit, offset, and currentUserId params (if present)
  const countParams = currentUserId ? params.slice(0, -3) : params.slice(0, -2);

  const [discussions, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, countParams),
  ]);

  return {
    discussions: discussions.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].total),
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  };
};

/**
 * Get single discussion by ID with full details
 */
exports.getDiscussionById = async (discussionId, currentUserId = null) => {
  // Build user-specific clause with parameterized query to prevent SQL injection
  const params = [discussionId];
  let userLikedSavedClause = "";

  if (currentUserId) {
    userLikedSavedClause = `,
        EXISTS(
          SELECT 1 FROM portal.discussion_likes dl 
          WHERE dl.discussion_id = d.discussion_id AND dl.user_id = $2 AND dl.vote_type = 1
        ) AS user_liked,
        EXISTS(
          SELECT 1 FROM portal.saved_discussions sd 
          WHERE sd.discussion_id = d.discussion_id AND sd.user_id = $2
        ) AS user_saved,
        COALESCE((
          SELECT vote_type FROM portal.discussion_likes dl
          WHERE dl.discussion_id = d.discussion_id AND dl.user_id = $2
        ), 0) AS user_vote
      `;
    params.push(parseInt(currentUserId));
  } else {
    userLikedSavedClause = `, FALSE AS user_liked, FALSE AS user_saved, 0 AS user_vote`;
  }

  const query = `
    SELECT 
      d.*,
      u.user_id AS author_id,
      u.full_name AS author,
      u.profile_image AS author_avatar,
      f.field_name AS specialization_name,
      ad.full_name AS degree_name,
      jm.role_name AS job_role_name,
      p.program_name,
      COALESCE(
        (
          SELECT json_agg(json_build_object('tag_id', t.tag_id, 'name', t.name, 'slug', t.slug))
          FROM portal.discussion_tags dt
          JOIN portal.tags t ON t.tag_id = dt.tag_id
          WHERE dt.discussion_id = d.discussion_id
        ), '[]'
      ) AS tags
      ${userLikedSavedClause}
    FROM portal.discussions d
    JOIN portal.users u ON u.user_id = d.user_id
    LEFT JOIN portal.it_fields f ON f.id = d.specialization_id
    LEFT JOIN portal.academic_degrees ad ON ad.id = d.degree_id
    LEFT JOIN portal.job_market_insights jm ON jm.id = d.job_role_id
    LEFT JOIN portal.programs p ON p.program_id = d.program_id
    WHERE d.discussion_id = $1 AND d.deleted_at IS NULL AND d.is_deleted = FALSE AND u.status = 'active'
  `;

  const result = await pool.query(query, params);
  return result.rows[0] || null;
};

/**
 * Create a new discussion with tags
 */
exports.createDiscussion = async (discussionData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Insert discussion
    const discussionResult = await client.query(
      `INSERT INTO portal.discussions 
        (user_id, title, content, specialization_id, degree_id, job_role_id, program_id, image_url, image_public_id, image_caption)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        discussionData.userId,
        discussionData.title,
        discussionData.content,
        discussionData.specializationId || null,
        discussionData.degreeId || null,
        discussionData.jobRoleId || null,
        discussionData.programId || null,
        discussionData.imageUrl || null,
        discussionData.imagePublicId || null,
        discussionData.imageCaption || null,
      ],
    );

    const discussion = discussionResult.rows[0];

    // Insert tags if provided
    if (discussionData.tags && discussionData.tags.length > 0) {
      const tagValues = discussionData.tags
        .map((_, i) => `($1, $${i + 2})`)
        .join(", ");
      const tagParams = [discussion.discussion_id, ...discussionData.tags];

      await client.query(
        `INSERT INTO portal.discussion_tags (discussion_id, tag_id)
         VALUES ${tagValues}
         ON CONFLICT DO NOTHING`,
        tagParams,
      );
    }

    await client.query("COMMIT");

    // Grant XP for post creation
    await XPService.updateUserXP(
      discussionData.userId,
      5,
      "Discussion Post Creation",
    );

    return discussion;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update a discussion (with 24-hour edit window check)
 */
exports.updateDiscussion = async (
  discussionId,
  userId,
  updateData,
  isAdmin = false,
) => {
  // First, check ownership and edit window
  const checkResult = await pool.query(
    `SELECT user_id, created_at FROM portal.discussions WHERE discussion_id = $1 AND deleted_at IS NULL`,
    [discussionId],
  );

  if (checkResult.rows.length === 0) {
    throw new Error("Discussion not found");
  }

  const discussion = checkResult.rows[0];

  // Check ownership
  if (Number(discussion.user_id) !== Number(userId) && !isAdmin) {
    throw new Error("Not authorized to edit this discussion");
  }

  // Check 24-hour edit window (admin bypasses)
  if (!isAdmin) {
    const hoursPassed =
      (Date.now() - new Date(discussion.created_at).getTime()) /
      (1000 * 60 * 60);
    if (hoursPassed > 24) {
      throw new Error("Edit window expired (24 hours)");
    }
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Update discussion
    const updateResult = await client.query(
      `UPDATE portal.discussions
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           specialization_id = COALESCE($3, specialization_id),
           degree_id = COALESCE($4, degree_id),
           job_role_id = COALESCE($5, job_role_id),
           updated_at = NOW()
       WHERE discussion_id = $6
       RETURNING *`,
      [
        updateData.title,
        updateData.content,
        updateData.specializationId,
        updateData.degreeId,
        updateData.jobRoleId,
        discussionId,
      ],
    );

    // Update tags if provided
    if (updateData.tags) {
      // Remove existing tags
      await client.query(
        `DELETE FROM portal.discussion_tags WHERE discussion_id = $1`,
        [discussionId],
      );

      // Add new tags
      if (updateData.tags.length > 0) {
        const tagValues = updateData.tags
          .map((_, i) => `($1, $${i + 2})`)
          .join(", ");
        const tagParams = [discussionId, ...updateData.tags];

        await client.query(
          `INSERT INTO portal.discussion_tags (discussion_id, tag_id)
           VALUES ${tagValues}
           ON CONFLICT DO NOTHING`,
          tagParams,
        );
      }
    }

    await client.query("COMMIT");
    return updateResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete a discussion (Soft or Hard)
 */
exports.deleteDiscussion = async (discussionId, userId, isAdmin = false) => {
  const checkResult = await pool.query(
    `SELECT user_id FROM portal.discussions WHERE discussion_id = $1`,
    [discussionId],
  );

  if (checkResult.rows.length === 0) {
    throw new Error("Discussion not found");
  }

  const post = checkResult.rows[0];

  if (isAdmin) {
    // Admin performs HARD DELETE
    await pool.query(
      `DELETE FROM portal.discussions WHERE discussion_id = $1`,
      [discussionId],
    );
  } else if (Number(post.user_id) === Number(userId)) {
    // Owner performs SOFT DELETE
    await pool.query(
      `UPDATE portal.discussions SET deleted_at = NOW(), is_deleted = TRUE WHERE discussion_id = $1`,
      [discussionId],
    );
  } else {
    throw new Error("Not authorized to delete this discussion");
  }

  return true;
};

/**
 * Hard delete a discussion (permanently remove)
 */
exports.hardDeleteDiscussion = async (discussionId, userId) => {
  const checkResult = await pool.query(
    `SELECT user_id FROM portal.discussions WHERE discussion_id = $1`,
    [discussionId],
  );

  if (checkResult.rows.length === 0) {
    throw new Error("Discussion not found");
  }

  if (checkResult.rows[0].user_id !== userId) {
    throw new Error("Not authorized to hard delete this discussion");
  }

  // Permanently remove from DB
  await pool.query(`DELETE FROM portal.discussions WHERE discussion_id = $1`, [
    discussionId,
  ]);

  return true;
};

/**
 * Handle voting (Upvote/Downvote) on a discussion
 */
exports.handleVote = async (discussionId, userId, voteType) => {
  const discId = parseInt(discussionId);
  const uId = parseInt(userId);

  if (isNaN(discId) || isNaN(uId)) {
    throw new Error(
      `Invalid IDs: discussionId=${discussionId}, userId=${userId}`,
    );
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get existing vote
    const existingRes = await client.query(
      `SELECT vote_type FROM portal.discussion_likes WHERE discussion_id = $1 AND user_id = $2`,
      [discId, uId],
    );

    const oldVoteType =
      existingRes.rows.length > 0 ? existingRes.rows[0].vote_type : 0;

    // YouTube-style toggle: clicking same button removes the vote
    const newVoteType = oldVoteType === voteType ? 0 : voteType;

    // 2. Update discussion_likes table
    if (oldVoteType === 0 && newVoteType !== 0) {
      // Insert new vote
      await client.query(
        `INSERT INTO portal.discussion_likes (discussion_id, user_id, vote_type) 
         VALUES ($1, $2, $3)
         ON CONFLICT (discussion_id, user_id) 
         DO UPDATE SET vote_type = EXCLUDED.vote_type`,
        [discId, uId, newVoteType],
      );
    } else if (newVoteType === 0) {
      // Remove vote entirely
      await client.query(
        `DELETE FROM portal.discussion_likes WHERE discussion_id = $1 AND user_id = $2`,
        [discId, uId],
      );
    } else {
      // Update existing vote
      await client.query(
        `UPDATE portal.discussion_likes SET vote_type = $1 WHERE discussion_id = $2 AND user_id = $3`,
        [newVoteType, discId, uId],
      );
    }

    // 3. Count only upvotes for display (YouTube-style)
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
    const diff = newVoteType - oldVoteType;

    // 4. XP Logic
    const authorRes = await client.query(
      "SELECT user_id FROM portal.discussions WHERE discussion_id = $1",
      [discId],
    );
    const authorId = authorRes.rows[0]?.user_id;

    if (authorId && authorId !== uId) {
      // Grant +10 XP for NEW upvote
      if (newVoteType === 1 && oldVoteType !== 1) {
        await XPService.updateUserXP(
          authorId,
          10,
          "Received a Discussion Upvote",
          client,
        );
      }
      // Deduct 10 XP if removing upvote (toggle off or switch to downvote)
      else if (oldVoteType === 1 && newVoteType !== 1) {
        await XPService.updateUserXP(
          authorId,
          -10,
          "Discussion Upvote Removed",
          client,
        );
      }
    }

    await client.query("COMMIT");
    return { voteType: newVoteType, scoreDiff: diff };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Toggle like on a discussion (Legacy/Compatibility)
 */
exports.toggleLike = async (discussionId, userId) => {
  return exports.handleVote(discussionId, userId, 1);
};

/**
 * Add a comment to a discussion
 */
exports.addComment = async (discussionId, userId, content, parentId = null) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO portal.discussion_comments (discussion_id, user_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [discussionId, userId, content, parentId],
    );

    // Update comment count
    await client.query(
      `UPDATE portal.discussions SET comment_count = comment_count + 1 WHERE discussion_id = $1`,
      [discussionId],
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Handle voting (Upvote/Downvote) on a comment
 * Grants +2 XP for upvotes, deducts 2 XP if switching from UP to DOWN
 */
exports.handleCommentVote = async (commentId, userId, voteType) => {
  const commId = parseInt(commentId);
  const uId = parseInt(userId);

  if (isNaN(commId) || isNaN(uId)) {
    throw new Error(`Invalid IDs: commentId=${commentId}, userId=${userId}`);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get existing vote
    const existingRes = await client.query(
      `SELECT vote_type FROM portal.comment_likes WHERE comment_id = $1 AND user_id = $2`,
      [commId, uId],
    );

    const oldVoteType =
      existingRes.rows.length > 0 ? existingRes.rows[0].vote_type : 0;

    // YouTube-style toggle: clicking same button removes the vote
    const newVoteType = oldVoteType === voteType ? 0 : voteType;

    // 2. Update comment_likes table
    if (oldVoteType === 0 && newVoteType !== 0) {
      // Insert new vote
      await client.query(
        `INSERT INTO portal.comment_likes (comment_id, user_id, vote_type) VALUES ($1, $2, $3)`,
        [commId, uId, newVoteType],
      );
    } else if (newVoteType === 0) {
      // Remove vote entirely
      await client.query(
        `DELETE FROM portal.comment_likes WHERE comment_id = $1 AND user_id = $2`,
        [commId, uId],
      );
    } else {
      // Update existing vote
      await client.query(
        `UPDATE portal.comment_likes SET vote_type = $1 WHERE comment_id = $2 AND user_id = $3`,
        [newVoteType, commId, uId],
      );
    }

    // 3. Count only upvotes for display (YouTube-style)
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
    const diff = newVoteType - oldVoteType;

    // 4. XP Logic: Author gets +2 VXP
    const authorRes = await client.query(
      "SELECT user_id FROM portal.discussion_comments WHERE comment_id = $1",
      [commId],
    );
    const authorId = authorRes.rows[0]?.user_id;

    if (authorId && authorId !== uId) {
      // Grant +2 XP for NEW upvote
      if (newVoteType === 1 && oldVoteType !== 1) {
        await XPService.updateUserXP(
          authorId,
          2,
          "Comment received an Upvote",
          client,
        );
      }
      // Deduct 2 XP if removing upvote (toggle off or switch to downvote)
      else if (oldVoteType === 1 && newVoteType !== 1) {
        await XPService.updateUserXP(
          authorId,
          -2,
          "Comment Upvote Removed",
          client,
        );
      }
    }

    await client.query("COMMIT");
    return { voteType: newVoteType, scoreDiff: diff };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get comments for a discussion with optional sorting
 */
exports.getComments = async (
  discussionId,
  currentUserId = null,
  sort = "newest",
) => {
  const dId = parseInt(discussionId);
  const params = [dId];
  let userVoteClause = "0";

  if (currentUserId) {
    userVoteClause = `COALESCE((SELECT vote_type FROM portal.comment_likes cl WHERE cl.comment_id = c.comment_id AND cl.user_id = $2), 0)`;
    params.push(parseInt(currentUserId));
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

/**
 * Delete a comment (Soft or Hard)
 */
exports.deleteComment = async (commentId, userId, isAdmin = false) => {
  const checkResult = await pool.query(
    `SELECT c.user_id, c.discussion_id FROM portal.discussion_comments c WHERE c.comment_id = $1`,
    [commentId],
  );

  if (checkResult.rows.length === 0) {
    throw new Error("Comment not found");
  }

  const comment = checkResult.rows[0];

  if (isAdmin) {
    // Admin performs HARD DELETE
    await pool.query(
      `DELETE FROM portal.discussion_comments WHERE comment_id = $1`,
      [commentId],
    );
  } else if (Number(comment.user_id) === Number(userId)) {
    // Owner performs SOFT DELETE
    await pool.query(
      `UPDATE portal.discussion_comments SET deleted_at = NOW() WHERE comment_id = $1`,
      [commentId],
    );
  } else {
    throw new Error("Not authorized to delete this comment");
  }

  // Update comment count
  await pool.query(
    `UPDATE portal.discussions SET comment_count = GREATEST(0, comment_count - 1) WHERE discussion_id = $1`,
    [comment.discussion_id],
  );

  return true;
};

/**
 * Toggle save/unsave a discussion
 * Max 50 saved discussions per user
 */
const MAX_SAVED_DISCUSSIONS = 50;

exports.toggleSave = async (discussionId, userId) => {
  // Ensure IDs are integers
  const discId = parseInt(discussionId);
  const uId = parseInt(userId);

  if (isNaN(discId) || isNaN(uId)) {
    throw new Error(
      `Invalid IDs: discussionId=${discussionId}, userId=${userId}`,
    );
  }

  const exists = await pool.query(
    `SELECT 1 FROM portal.saved_discussions WHERE discussion_id = $1 AND user_id = $2`,
    [discId, uId],
  );

  if (exists.rows.length > 0) {
    await pool.query(
      `DELETE FROM portal.saved_discussions WHERE discussion_id = $1 AND user_id = $2`,
      [discId, uId],
    );
    return { saved: false };
  } else {
    // Check max saved limit before saving
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM portal.saved_discussions WHERE user_id = $1`,
      [uId],
    );
    const currentCount = parseInt(countResult.rows[0].count);

    if (currentCount >= MAX_SAVED_DISCUSSIONS) {
      throw new Error(
        `Maximum ${MAX_SAVED_DISCUSSIONS} saved discussions allowed. Please unsave some to save more.`,
      );
    }

    await pool.query(
      `INSERT INTO portal.saved_discussions (discussion_id, user_id) VALUES ($1, $2)`,
      [discId, uId],
    );
    return {
      saved: true,
      savedCount: currentCount + 1,
      maxSaved: MAX_SAVED_DISCUSSIONS,
    };
  }
};

exports.boostDiscussion = async (discussionId, userId) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Check if user has enough reputation points
    const userRes = await client.query(
      `SELECT reputation_points FROM portal.users WHERE user_id = $1`,
      [userId],
    );

    if (userRes.rows.length === 0) {
      throw new Error("User not found");
    }

    const { reputation_points } = userRes.rows[0];
    if ((reputation_points || 0) < 50) {
      throw new Error(
        "Insufficient reputation points (50 points required to boost)",
      );
    }

    // 2. Check if discussion exists and is not already actively boosted
    const discussionRes = await client.query(
      `SELECT is_boosted, boosted_until FROM portal.discussions WHERE discussion_id = $1 AND deleted_at IS NULL`,
      [discussionId],
    );

    if (discussionRes.rows.length === 0) {
      throw new Error("Discussion not found");
    }

    const discussion = discussionRes.rows[0];
    if (
      discussion.is_boosted &&
      new Date(discussion.boosted_until) > new Date()
    ) {
      throw new Error("Discussion is already actively boosted");
    }

    // 3. Deduct points
    await client.query(
      `UPDATE portal.users SET reputation_points = reputation_points - 50 WHERE user_id = $1`,
      [userId],
    );

    // 4. Boost discussion
    const boostRes = await client.query(
      `UPDATE portal.discussions 
       SET is_boosted = TRUE, 
           boosted_until = NOW() + INTERVAL '24 hours' 
       WHERE discussion_id = $1
       RETURNING *`,
      [discussionId],
    );

    await client.query("COMMIT");
    return boostRes.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get user's saved discussions
 */
exports.getSavedDiscussions = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      d.discussion_id,
      d.title,
      d.content,
      d.created_at,
      d.like_count,
      (
        SELECT count(*)::int 
        FROM portal.discussion_comments c 
        JOIN portal.users cu ON cu.user_id = c.user_id 
        WHERE c.discussion_id = d.discussion_id 
          AND c.deleted_at IS NULL 
          AND c.is_deleted = FALSE 
          AND cu.status = 'active'
      ) AS comment_count,
      u.full_name AS author,
      sd.saved_at
    FROM portal.saved_discussions sd
    JOIN portal.discussions d ON d.discussion_id = sd.discussion_id
    JOIN portal.users u ON u.user_id = d.user_id
    WHERE sd.user_id = $1 AND d.deleted_at IS NULL
    ORDER BY sd.saved_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM portal.saved_discussions sd
    JOIN portal.discussions d ON d.discussion_id = sd.discussion_id
    WHERE sd.user_id = $1 AND d.deleted_at IS NULL
  `;

  const [discussions, countResult] = await Promise.all([
    pool.query(query, [userId, limit, offset]),
    pool.query(countQuery, [userId]),
  ]);

  return {
    discussions: discussions.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].total),
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  };
};

/**
 * Get user's own posts (My Posts)
 */
exports.getMyPosts = async (userId, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const query = `
    SELECT 
      d.discussion_id,
      d.title,
      d.content,
      d.created_at,
      d.updated_at,
      d.like_count,
      (
        SELECT count(*)::int 
        FROM portal.discussion_comments c 
        JOIN portal.users cu ON cu.user_id = c.user_id 
        WHERE c.discussion_id = d.discussion_id 
          AND c.deleted_at IS NULL 
          AND c.is_deleted = FALSE 
          AND cu.status = 'active'
      ) AS comment_count,
      d.image_url,
      COALESCE(
        (
          SELECT json_agg(json_build_object('tag_id', t.tag_id, 'name', t.name, 'slug', t.slug))
          FROM portal.discussion_tags dt
          JOIN portal.tags t ON t.tag_id = dt.tag_id
          WHERE dt.discussion_id = d.discussion_id
        ), '[]'
      ) AS tags,
      CASE WHEN (NOW() - d.created_at) < INTERVAL '24 hours' THEN true ELSE false END AS can_edit
    FROM portal.discussions d
    WHERE d.user_id = $1 AND d.deleted_at IS NULL
    ORDER BY d.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM portal.discussions d
    WHERE d.user_id = $1 AND d.deleted_at IS NULL
  `;

  const [discussions, countResult] = await Promise.all([
    pool.query(query, [userId, limit, offset]),
    pool.query(countQuery, [userId]),
  ]);

  return {
    discussions: discussions.rows,
    pagination: {
      page,
      limit,
      total: parseInt(countResult.rows[0].total),
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  };
};

/**
 * Get trending discussions (last 7 days)
 */
exports.getTrendingDiscussions = async (limit = 10) => {
  const query = `
    SELECT 
      d.discussion_id,
      d.title,
      d.content,
      d.created_at,
      d.like_count,
      (
        SELECT count(*)::int 
        FROM portal.discussion_comments c 
        JOIN portal.users cu ON cu.user_id = c.user_id 
        WHERE c.discussion_id = d.discussion_id 
          AND c.deleted_at IS NULL 
          AND c.is_deleted = FALSE 
          AND cu.status = 'active'
      ) AS comment_count,
      (d.like_count * 2 + d.comment_count) AS trending_score,
      u.full_name AS author,
      u.profile_image AS author_avatar
    FROM portal.discussions d
    JOIN portal.users u ON u.user_id = d.user_id
    WHERE d.deleted_at IS NULL
      AND d.created_at > NOW() - INTERVAL '7 days'
    ORDER BY trending_score DESC, d.created_at DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);
  return result.rows;
};

/**
 * Get all tags for filter options
 */
exports.getAllTags = async () => {
  try {
    const result = await pool.query(
      `SELECT tag_id, name, slug FROM portal.tags ORDER BY name`,
    );
    return result.rows;
  } catch (err) {
    // Table may not exist yet - return empty array
    console.error("getAllTags error (table may not exist):", err.message);
    return [];
  }
};

/**
 * Get or create tags by name
 */
exports.getOrCreateTags = async (tagNames) => {
  const tags = [];

  for (const name of tagNames) {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    // Try to find existing tag
    let result = await pool.query(
      `SELECT tag_id FROM portal.tags WHERE slug = $1 OR LOWER(name) = LOWER($2)`,
      [slug, name],
    );

    if (result.rows.length > 0) {
      tags.push(result.rows[0].tag_id);
    } else {
      // Create new tag
      result = await pool.query(
        `INSERT INTO portal.tags (name, slug) VALUES ($1, $2) RETURNING tag_id`,
        [name, slug],
      );
      tags.push(result.rows[0].tag_id);
    }
  }

  return tags;
};

/**
 * Get user's default filter preferences
 */
exports.getUserFilterDefaults = async (userId) => {
  const result = await pool.query(
    `SELECT 
      u.program_id,
      u.it_field_id AS specialization_id,
      u.academic_degree_id AS degree_id,
      p.program_name
     FROM portal.users u
     LEFT JOIN portal.programs p ON p.program_id = u.program_id
     WHERE u.user_id = $1`,
    [userId],
  );
  return result.rows[0] || null;
};

/**
 * Create notification for discussion activity
 */
exports.createNotification = async (
  userId,
  type,
  message,
  actorUserId,
  referenceId,
  referenceType,
) => {
  await pool.query(
    `INSERT INTO portal.notifications 
      (user_id, type, message, actor_user_id, reference_id, reference_type)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, type, message, actorUserId, referenceId, referenceType],
  );
};
