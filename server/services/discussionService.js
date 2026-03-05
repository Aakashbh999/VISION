/**
 * Discussion Service - Database Layer
 * Handles all SQL operations for the discussion system
 */

const pool = require("../config/db");

/**
 * Build dynamic WHERE conditions for filtering
 * @param {Object} filters - Filter parameters
 * @returns {Object} - { whereClause, params, paramIndex }
 */
const buildFilterConditions = (filters, startParamIndex = 1) => {
  const conditions = ["d.is_deleted = FALSE"];
  const params = [];
  let paramIndex = startParamIndex;

  if (filters.specialization) {
    conditions.push(`d.id = $${paramIndex}`);
    params.push(parseInt(filters.specialization));
    paramIndex++;
  }

  if (filters.degree) {
    conditions.push(`d.id = $${paramIndex}`);
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
    conditions.push(
      `(d.title ILIKE $${paramIndex} OR d.content ILIKE $${paramIndex})`,
    );
    params.push(`%${filters.search}%`);
    paramIndex++;
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
 * @param {string} sort - Sort option
 * @returns {string} - ORDER BY clause
 */
const buildSortClause = (sort) => {
  switch (sort) {
    case "popular":
      return "ORDER BY d.like_count DESC, d.created_at DESC";
    case "discussed":
      return "ORDER BY d.comment_count DESC, d.created_at DESC";
    case "trending":
      return "ORDER BY (d.like_count * 2 + d.comment_count) DESC, d.created_at DESC";
    case "oldest":
      return "ORDER BY d.created_at ASC";
    default:
      return "ORDER BY d.created_at DESC";
  }
};

/**
 * Get all discussions with filters, sorting, and pagination
 */
exports.getDiscussions = async (filters = {}, currentUserId = null) => {
  const { whereClause, params, paramIndex } = buildFilterConditions(filters);
  const sortClause = buildSortClause(filters.sort);

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const offset = (page - 1) * limit;

  params.push(limit, offset);

  const query = `
    SELECT 
      d.discussion_id,
      d.title,
      d.content,
      d.created_at,
      d.updated_at,
      d.like_count,
      d.comment_count,
      d.image_url,
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
      ${
        currentUserId
          ? `,
        EXISTS(
          SELECT 1 FROM portal.discussion_likes dl 
          WHERE dl.discussion_id = d.discussion_id AND dl.user_id = ${currentUserId}
        ) AS user_liked,
        EXISTS(
          SELECT 1 FROM portal.saved_discussions sd 
          WHERE sd.discussion_id = d.discussion_id AND sd.user_id = ${currentUserId}
        ) AS user_saved
      `
          : ""
      }
    FROM portal.discussions d
    JOIN portal.users u ON u.user_id = d.user_id
    LEFT JOIN portal.it_fields f ON f.id = d.specialization_id
    LEFT JOIN portal.academic_degrees ad ON ad.id = d.degree_id
    LEFT JOIN portal.job_market_insights jm ON jm.id = d.job_role_id
    LEFT JOIN portal.programs p ON p.program_id = d.program_id
    WHERE ${whereClause}
    ${sortClause}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM portal.discussions d
    WHERE ${whereClause}
  `;

  const [discussions, countResult] = await Promise.all([
    pool.query(query, params),
    pool.query(countQuery, params.slice(0, -2)), // Remove limit/offset params
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
      ${
        currentUserId
          ? `,
        EXISTS(
          SELECT 1 FROM portal.discussion_likes dl 
          WHERE dl.discussion_id = d.discussion_id AND dl.user_id = ${currentUserId}
        ) AS user_liked,
        EXISTS(
          SELECT 1 FROM portal.saved_discussions sd 
          WHERE sd.discussion_id = d.discussion_id AND sd.user_id = ${currentUserId}
        ) AS user_saved
      `
          : ""
      }
    FROM portal.discussions d
    JOIN portal.users u ON u.user_id = d.user_id
    LEFT JOIN portal.it_fields f ON f.id = d.specialization_id
    LEFT JOIN portal.academic_degrees ad ON ad.id = d.degree_id
    LEFT JOIN portal.job_market_insights jm ON jm.id = d.job_role_id
    LEFT JOIN portal.programs p ON p.program_id = d.program_id
    WHERE d.discussion_id = $1 AND d.is_deleted = FALSE
  `;

  const result = await pool.query(query, [discussionId]);
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
        (user_id, title, content, specialization_id, degree_id, job_role_id, program_id, image_url, image_public_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
    `SELECT user_id, created_at FROM portal.discussions WHERE discussion_id = $1 AND is_deleted = FALSE`,
    [discussionId],
  );

  if (checkResult.rows.length === 0) {
    throw new Error("Discussion not found");
  }

  const discussion = checkResult.rows[0];

  // Check ownership
  if (discussion.user_id !== userId && !isAdmin) {
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
 * Soft delete a discussion
 */
exports.deleteDiscussion = async (discussionId, userId, isAdmin = false) => {
  const checkResult = await pool.query(
    `SELECT user_id FROM portal.discussions WHERE discussion_id = $1 AND is_deleted = FALSE`,
    [discussionId],
  );

  if (checkResult.rows.length === 0) {
    throw new Error("Discussion not found");
  }

  if (checkResult.rows[0].user_id !== userId && !isAdmin) {
    throw new Error("Not authorized to delete this discussion");
  }

  await pool.query(
    `UPDATE portal.discussions SET is_deleted = TRUE WHERE discussion_id = $1`,
    [discussionId],
  );

  return true;
};

/**
 * Toggle like on a discussion
 */
exports.toggleLike = async (discussionId, userId) => {
  // Ensure IDs are integers
  const discId = parseInt(discussionId);
  const uId = parseInt(userId);

  if (isNaN(discId) || isNaN(uId)) {
    throw new Error(
      `Invalid IDs: discussionId=${discussionId}, userId=${userId}`,
    );
  }

  const exists = await pool.query(
    `SELECT 1 FROM portal.discussion_likes WHERE discussion_id = $1 AND user_id = $2`,
    [discId, uId],
  );

  if (exists.rows.length > 0) {
    // Unlike
    await pool.query(
      `DELETE FROM portal.discussion_likes WHERE discussion_id = $1 AND user_id = $2`,
      [discId, uId],
    );
    await pool.query(
      `UPDATE portal.discussions SET like_count = GREATEST(0, COALESCE(like_count, 0) - 1) WHERE discussion_id = $1`,
      [discId],
    );
    return { liked: false };
  } else {
    // Like
    await pool.query(
      `INSERT INTO portal.discussion_likes (discussion_id, user_id) VALUES ($1, $2)`,
      [discId, uId],
    );
    await pool.query(
      `UPDATE portal.discussions SET like_count = COALESCE(like_count, 0) + 1 WHERE discussion_id = $1`,
      [discId],
    );
    return { liked: true };
  }
};

/**
 * Add a comment to a discussion
 */
exports.addComment = async (discussionId, userId, content) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO portal.discussion_comments (discussion_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [discussionId, userId, content],
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
 * Get comments for a discussion
 */
exports.getComments = async (discussionId) => {
  const result = await pool.query(
    `SELECT 
      c.comment_id,
      c.content,
      c.created_at,
      u.user_id,
      u.full_name,
      u.profile_image
     FROM portal.discussion_comments c
     JOIN portal.users u ON u.user_id = c.user_id
     WHERE c.discussion_id = $1 AND (c.is_deleted IS NULL OR c.is_deleted = FALSE)
     ORDER BY c.created_at ASC`,
    [discussionId],
  );
  return result.rows;
};

/**
 * Delete a comment (soft delete)
 */
exports.deleteComment = async (commentId, userId, isAdmin = false) => {
  const checkResult = await pool.query(
    `SELECT c.user_id, c.discussion_id FROM portal.discussion_comments c WHERE c.comment_id = $1`,
    [commentId],
  );

  if (checkResult.rows.length === 0) {
    throw new Error("Comment not found");
  }

  if (checkResult.rows[0].user_id !== userId && !isAdmin) {
    throw new Error("Not authorized to delete this comment");
  }

  const discussionId = checkResult.rows[0].discussion_id;

  await pool.query(
    `UPDATE portal.discussion_comments SET is_deleted = TRUE WHERE comment_id = $1`,
    [commentId],
  );

  // Update comment count
  await pool.query(
    `UPDATE portal.discussions SET comment_count = GREATEST(0, comment_count - 1) WHERE discussion_id = $1`,
    [discussionId],
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
      d.comment_count,
      u.full_name AS author,
      sd.saved_at
    FROM portal.saved_discussions sd
    JOIN portal.discussions d ON d.discussion_id = sd.discussion_id
    JOIN portal.users u ON u.user_id = d.user_id
    WHERE sd.user_id = $1 AND d.is_deleted = FALSE
    ORDER BY sd.saved_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM portal.saved_discussions sd
    JOIN portal.discussions d ON d.discussion_id = sd.discussion_id
    WHERE sd.user_id = $1 AND d.is_deleted = FALSE
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
      d.comment_count,
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
    WHERE d.user_id = $1 AND d.is_deleted = FALSE
    ORDER BY d.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM portal.discussions d
    WHERE d.user_id = $1 AND d.is_deleted = FALSE
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
      d.comment_count,
      (d.like_count * 2 + d.comment_count) AS trending_score,
      u.full_name AS author,
      u.profile_image AS author_avatar
    FROM portal.discussions d
    JOIN portal.users u ON u.user_id = d.user_id
    WHERE d.is_deleted = FALSE
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
