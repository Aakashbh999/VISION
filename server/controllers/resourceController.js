/**
 * Resource Controller
 * Manages learning resource lifecycle including uploads, approvals, and user interactions.
 * Supports multiple resource types (notes, books, projects, links) with tagging and categorization.
 *
 * Features:
 * - Resource upload with type validation and tag management (system + custom)
 * - Approval workflow for resource vetting (pending → approved/rejected)
 * - Admin approval/rejection with activity logging
 * - Resource search with multi-dimensional filtering (program, semester, type, tags)
 * - User's resource library browsing
 * - Pending resource management for administrators
 * - XP reward system for resource contributions (100 VXP on approval)
 * - Hashtag auto-extraction from descriptions for semester inference
 */

const pool = require("../config/db");
const { notify, feed, notifyAdmins } = require("../utils/activityService");
const { successResponse, errorResponse } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");
const { withTransaction } = require("../utils/withTransaction");
const {
  parseSystemTagIds,
  parseCustomTagNames,
  insertSystemTags,
} = require("../utils/tagUtils");

/**
 * Upload new learning resource
 * Creates resource with auto-approval pending review or immediate publication
 * Supports multiple resource types with tag management and hashtag extraction for semester inference
 *
 * Resource Types: notes, book, project, link
 * Tag Limits: Max 5 system tags + max 2 custom tags
 *
 * @async
 * @param {Object} req - Express request (requires auth)
 * @param {Object} req.user - { portal_user_id }
 * @param {Object} req.body - {
 *   title: string (required) - Resource title
 *   description: string - Full description (hashtags extracted for semester)
 *   resource_type: string (required) - notes|book|project|link
 *   program_id?: number - Academic program
 *   semester?: number - Semester (or extracted from hashtags)
 *   degree_id?: number - Academic degree
 *   url?: string - External link (for link type)
 *   system_tags?: string - JSON array of tag IDs

 * }
 * @param {Object} res - Express response
 * @returns {Object} - Created resource with { resource_id, status, created_at }
 * @throws {Error} - 400 if validation fails, 409 if duplicate detected
 */
exports.uploadResource = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;
  const {
    title,
    description,
    resource_type,
    program_id,
    semester,
    degree_id,
    url,
    system_tags: systemTagsRaw,
  } = req.body;
  const { extractHashtagsAndSemester } = require("../utils/hashtagUtils");

  const { semester: extractedSemester } =
    extractHashtagsAndSemester(description);

  const systemTagIds = parseSystemTagIds(systemTagsRaw);

  if (systemTagIds.length > 5) {
    return errorResponse(res, "You can select at most 5 system tags.", 400);
  }

  const finalSemester = semester || extractedSemester;
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const normalizedDescription =
    typeof description === "string" ? description.trim() : "";
  const normalizedResourceType =
    typeof resource_type === "string" ? resource_type.trim().toLowerCase() : "";
  const normalizedUrl = typeof url === "string" ? url.trim() : "";
  const allowedResourceTypes = new Set(["notes", "book", "project", "link"]);

  if (!normalizedTitle || !normalizedResourceType) {
    return errorResponse(res, "title and resource_type are required", 400);
  }
  if (normalizedTitle.length < 3) {
    return errorResponse(res, "Title must be at least 3 characters", 400);
  }
  if (!allowedResourceTypes.has(normalizedResourceType)) {
    return errorResponse(
      res,
      "Invalid resource_type. Use notes, book, project, or link.",
      400,
    );
  }
  if (normalizedDescription && normalizedDescription.length > 5000) {
    return errorResponse(res, "Description is too long", 400);
  }

  let parsedSemester = finalSemester
    ? Number.parseInt(finalSemester, 10)
    : null;
  if (
    finalSemester &&
    (!Number.isInteger(parsedSemester) ||
      parsedSemester < 1 ||
      parsedSemester > 8)
  ) {
    return errorResponse(res, "Semester must be between 1 and 8", 400);
  }

  const resolvedProgramId = program_id || req.user.program_id;
  const resolvedDegreeId = degree_id || req.user.academic_degree_id;

  const parsedProgramId =
    resolvedProgramId !== undefined &&
    resolvedProgramId !== null &&
    resolvedProgramId !== ""
      ? Number.parseInt(resolvedProgramId, 10)
      : null;
  const parsedDegreeId =
    resolvedDegreeId !== undefined &&
    resolvedDegreeId !== null &&
    resolvedDegreeId !== ""
      ? Number.parseInt(resolvedDegreeId, 10)
      : null;

  if (program_id && !Number.isInteger(parsedProgramId)) {
    return errorResponse(res, "Invalid program_id", 400);
  }
  if (degree_id && !Number.isInteger(parsedDegreeId)) {
    return errorResponse(res, "Invalid degree_id", 400);
  }

  let fileUrl = null;
  let filePublicId = null;
  let originalFilename = null;

  if (normalizedResourceType === "link") {
    if (!normalizedUrl) {
      return errorResponse(res, "URL is required for link-type resources", 400);
    }
    try {
      new URL(normalizedUrl);
    } catch (_) {
      return errorResponse(res, "URL must be valid", 400);
    }
    fileUrl = normalizedUrl;
  } else {
    if (req.file) {
      fileUrl = req.file.path;
      filePublicId = req.file.filename;
      originalFilename = req.file.originalname;
    } else if (normalizedUrl) {
      fileUrl = normalizedUrl;
    } else {
      return errorResponse(res, "File upload or URL is required", 400);
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const finalStatus =
      req.user.role === "admin" && req.body.status === "approved"
        ? "approved"
        : "pending";

    const result = await client.query(
      `INSERT INTO portal.resources
           (title, description, resource_type, program_id, semester, degree_id, url,
            file_url, file_public_id, original_filename, status, created_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         RETURNING *`,
      [
        normalizedTitle,
        normalizedDescription || null,
        normalizedResourceType,
        parsedProgramId,
        parsedSemester,
        parsedDegreeId,
        normalizedResourceType === "link" ? normalizedUrl : null,
        fileUrl,
        filePublicId,
        originalFilename,
        finalStatus,
        userId,
      ],
    );

    const resourceId = result.rows[0].resource_id;

    await insertSystemTags(client, resourceId, systemTagIds);

    await client.query("COMMIT");

    const fullResource = await pool.query(
      `SELECT
         r.*,
         u.user_id AS uploader_id,
         u.full_name AS uploader_name,
         ad.degree_code AS degree_name,
         p.program_name
       FROM portal.resources r
       LEFT JOIN portal.users u ON u.user_id = r.created_by
       LEFT JOIN portal.academic_degrees ad ON ad.id = r.degree_id
       LEFT JOIN portal.programs p ON p.program_id = r.program_id
       WHERE r.resource_id = $1`,
      [resourceId],
    );

    if (finalStatus === "pending") {
      notifyAdmins({
        actorId: userId,
        type: 'new_resource_pending',
        title: 'New Resource Uploaded',
        message: `${fullResource.rows[0].uploader_name || 'A user'} uploaded a new resource "${normalizedTitle}" that requires approval`,
        relatedType: 'resource',
        relatedId: resourceId,
      }).catch(err => logger.error({ err }, "Admin notification failed"));
    }

    res.status(201).json({
      success: true,
      message:
        finalStatus === "approved"
          ? "Resource created and approved"
          : "Resource submitted for review",
      data: fullResource.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error.code === "23505") {
      return errorResponse(res, "This resource already exists.", 409);
    }
    if (error.code === "23514") {
      return errorResponse(res, "Resource data failed validation.", 400);
    }
    logger.error({ err: error }, "Resource upload failed");
    return errorResponse(res, "Failed to upload resource", 500);
  } finally {
    client.release();
  }
});

/**
 * Search and filter approved resources
 * Retrieves published resources with multi-dimensional filtering
 * Excludes resources linked to roadmap steps (those managed separately)
 *
 * @async
 * @param {Object} req - Express request
 * @param {string} [req.query.program_id] - Filter by program (1-5 = departments, others = specific programs)
 * @param {string} [req.query.semester] - Filter by semester
 * @param {string} [req.query.degree_id] - Filter by degree
 * @param {string} [req.query.resource_type] - Filter by type (notes, book, project, link)
 * @param {string} [req.query.search] - Full-text search in title/description
 * @param {string} [req.query.program_tag] - Filter by single tag
 * @param {string} [req.query.hashtags] - Filter by hashtag
 * @param {string} [req.query.sort] - Sort order (latest, popular, trending)
 * @param {string} [req.query.page] - Pagination (default: 1)
 * @param {string} [req.query.limit] - Per-page limit (default: 20, max: 50)
 * @param {Object} res - Express response
 * @returns {Object} - { resources: [], pagination: { page, limit, total, totalPages } }
 */
exports.getResources = catchAsync(async (req, res) => {
  const {
    program_id,
    semester,
    degree_id,
    resource_type,
    search,
    program_tag,
    hashtags,
    sort,
  } = req.query;

  const {
    page: pageNum,
    limit: limitNum,
    offset,
  } = parsePagination(req.query, {
    defaultLimit: 20,
    maxLimit: 50,
  });

  const params = [];
  const conditions = [
    "r.status = 'approved'",
    "r.deleted_at IS NULL",
    "r.resource_type <> 'link'",
    "NOT EXISTS (SELECT 1 FROM portal.step_resource_map srm WHERE srm.resource_id = r.resource_id)",
  ];

  if (program_id) {
    const pId = parseInt(program_id);
    params.push(pId);

    if (pId >= 1 && pId <= 5) {
      conditions.push(
        `(r.program_id = $${params.length} OR r.degree_id = $${params.length})`,
      );
    } else {
      conditions.push(`r.program_id = $${params.length}`);
    }
  }
  if (semester) {
    params.push(semester);
    conditions.push(`r.semester = $${params.length}`);
  }
  if (degree_id) {
    params.push(parseInt(degree_id));
    conditions.push(`r.degree_id = $${params.length}`);
  }
  if (resource_type) {
    if (resource_type === "pdf") {
      conditions.push(
        `(r.file_url ILIKE '%.pdf%' OR r.file_url ILIKE '%/raw/upload/%' OR (r.resource_type IN ('notes', 'book', 'project') AND r.file_url IS NOT NULL))`,
      );
    } else if (resource_type === "image") {
      conditions.push(
        `(r.file_url ILIKE '%.jpg%' OR r.file_url ILIKE '%.jpeg%' OR r.file_url ILIKE '%.png%' OR r.file_url ILIKE '%.gif%' OR r.file_url ILIKE '%.webp%')`,
      );
    } else {
      params.push(resource_type);
      conditions.push(`r.resource_type = $${params.length}`);
    }
  }
  if (search) {
    conditions.push(
      `(r.title % $${params.length + 1} OR r.description % $${params.length + 1} OR r.title ILIKE $${params.length + 2} OR r.description ILIKE $${params.length + 2})`,
    );
    params.push(search);
    params.push(`%${search}%`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM portal.resources r ${whereClause}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count);

  let selectAdditions = "";
  let joinAdditions = "";
  if (sort === "recommended" && req.user?.portal_user_id) {
    params.push(req.user.portal_user_id);
    selectAdditions = `, COALESCE(rs.score, 0) AS relevance_score`;
    joinAdditions = `LEFT JOIN portal.resource_scores rs ON rs.resource_id = r.resource_id AND rs.user_id = $${params.length}`;
  }

  params.push(limitNum, offset);

  const orderByClause =
    sort === "recommended" && req.user?.portal_user_id
      ? "relevance_score DESC, r.created_at DESC"
      : search
        ? `similarity(r.title, $${params.indexOf(search) + 1}) DESC`
        : "r.created_at DESC";

  const result = await pool.query(
    `SELECT
         r.*,
         u.user_id AS uploader_id,
         u.full_name AS uploader_name,
         ad.degree_code AS degree_name,
         p.program_name${selectAdditions}
       FROM portal.resources r
       LEFT JOIN portal.users u ON u.user_id = r.created_by
       LEFT JOIN portal.academic_degrees ad ON ad.id = r.degree_id
       LEFT JOIN portal.programs p ON p.program_id = r.program_id
       ${joinAdditions}
       ${whereClause}
       ORDER BY ${orderByClause}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  if (search && result.rows.length === 0) {
    const {
      userSemester,
      userProgramId,
      userDegreeId,
      portal_user_id: userId,
    } = req.user;
    const recommendationService = require("../services/recommendationService");
    const recommendations = await recommendationService.getRecommendations(
      userId,
      userSemester,
      userProgramId,
      userDegreeId,
      10,
    );
    return res.json({
      data: [],
      recommendations,
      noResults: true,
      meta: {
        totalItems: 0,
        currentPage: pageNum,
        totalPages: 0,
        hasNextPage: false,
      },
    });
  }

  return res.json({
    data: result.rows,
    meta: {
      totalItems: total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum * limitNum < total,
    },
  });
});

/**
 * Get user's uploaded resources
 * Retrieves all resources submitted by the current user regardless of approval status
 *
 * @async
 * @param {Object} req - Express request (requires auth)
 * @param {Object} req.user - { portal_user_id }
 * @param {string} [req.query.page] - Pagination
 * @param {string} [req.query.limit] - Per-page limit
 * @param {Object} res - Express response
 * @returns {Object} - { resources: [], pagination: {} }
 */
exports.getMyResources = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;
  const { status } = req.query;

  let statusCondition = "";
  let params = [userId];

  if (status && status !== "all") {
    statusCondition = "AND r.status = $2";
    params.push(status);
  }

  const result = await pool.query(
    `SELECT
         r.*,
         u.user_id AS uploader_id,
         u.full_name AS uploader_name,
         ad.degree_code AS degree_name,
         p.program_name
       FROM portal.resources r
       LEFT JOIN portal.users u ON u.user_id = r.created_by
       LEFT JOIN portal.academic_degrees ad ON ad.id = r.degree_id
       LEFT JOIN portal.programs p ON p.program_id = r.program_id
       WHERE r.created_by = $1
         AND r.deleted_at IS NULL
         AND r.resource_type <> 'link'
         AND NOT EXISTS (
           SELECT 1
           FROM portal.step_resource_map srm
           WHERE srm.resource_id = r.resource_id
         )
         ${statusCondition}
       ORDER BY r.created_at DESC`,
    params,
  );

  return res.json(result.rows);
});

/**
 * Get pending resource reviews (admin endpoint)
 * Lists resources awaiting approval or rejection
 *
 * @async
 * @param {Object} req - Express request (requires admin auth)
 * @param {string} [req.query.page] - Pagination
 * @param {string} [req.query.limit] - Per-page limit
 * @param {Object} res - Express response
 * @returns {Object} - { resources: [], pagination: {} }
 */
exports.getPendingResources = catchAsync(async (req, res) => {
  const { search } = req.query;
  const {
    page: pageNum,
    limit: limitNum,
    offset,
  } = parsePagination(req.query, {
    defaultLimit: 10,
    maxLimit: 50,
  });

  const conditions = ["r.status = 'pending'", "r.deleted_at IS NULL"];
  const params = [];

  if (search) {
    conditions.push(
      `(r.title ILIKE $${params.length + 1} OR r.description ILIKE $${params.length + 1} OR u.full_name ILIKE $${params.length + 1})`,
    );
    params.push(`%${search}%`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      `SELECT
           r.*,
           u.user_id AS uploader_id,
           u.full_name AS uploader_name,
           a.email    AS uploader_email,
           ad.degree_code AS degree_name,
           p.program_name
         FROM portal.resources r
         JOIN portal.users u   ON u.user_id   = r.created_by
         JOIN auth.users a     ON a.auth_user_id = u.auth_user_id
         LEFT JOIN portal.academic_degrees ad ON ad.id = r.degree_id
         LEFT JOIN portal.programs p          ON p.program_id = r.program_id
         ${whereClause}
         ORDER BY r.created_at ASC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limitNum, offset],
    ),
    pool.query(
      `SELECT COUNT(*) FROM portal.resources r
       JOIN portal.users u ON u.user_id = r.created_by
       ${whereClause}`,
      params,
    ),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return res.json({
    resources: dataResult.rows,
    pagination: {
      ...buildPaginationMeta({ total, page: pageNum, limit: limitNum }),
    },
    totalPages: Math.ceil(total / limitNum),
  });
});

/**
 * Approve pending resource (admin action)
 * Publishes resource and awards uploader with 100 VXP + 10 reputation points
 * Updates resource status and logs moderation action
 *
 * @async
 * @param {Object} req - Express request (requires admin auth)
 * @param {string} req.params.id - Resource ID
 * @param {Object} req.user - { portal_user_id } - Admin ID
 * @param {Object} res - Express response
 * @returns {Object} - { message, resource_id }
 * @throws {Error} - 404 if resource not found or already reviewed
 */
exports.approveResource = catchAsync(async (req, res) => {
  const { id } = req.params;
  const modId = req.user.portal_user_id;
  const { title, uploaderId } = await withTransaction(async (client) => {
    const resourceRes = await client.query(
      `UPDATE portal.resources
       SET status = 'approved'
       WHERE resource_id = $1 AND status = 'pending'
       RETURNING resource_id, title, created_by`,
      [id],
    );

    if (resourceRes.rowCount === 0) {
      const error = new Error("Resource not found or already reviewed");
      error.statusCode = 404;
      throw error;
    }

    const { title, created_by: uploaderId } = resourceRes.rows[0];

    await client.query(
      `UPDATE portal.users
       SET reputation_points = COALESCE(reputation_points, 0) + 10
       WHERE user_id = $1`,
      [uploaderId],
    );

    await client.query(
      `INSERT INTO portal.moderation_logs
         (admin_user_id, action_type, target_type, target_id)
       VALUES ($1, 'approve_resource', 'resource', $2)`,
      [modId, id],
    );
    return { title, uploaderId };
  });

  try {
    await notify({
      userId: uploaderId,
      actorId: modId,
      type: "resource_approved",
      title: "Resource Approved",
      message: `Your resource "${title}" was approved. You earned 10 reputation points!`,
      relatedType: "resource",
      relatedId: parseInt(id),
    });
  } catch (notifErr) {
    logger.warn({ err: notifErr }, "Resource approval notification failed");
  }

  try {
    await feed({
      actorId: uploaderId,
      actionType: "resource_uploaded",
      referenceType: "resource",
      referenceId: parseInt(id, 10),
      metadata: {
        title,
        approved_by: modId,
      },
    });
  } catch (feedErr) {
    logger.warn({ err: feedErr }, "Resource feed event failed");
  }

  return res.json({
    message: "Resource approved and uploader awarded 10 reputation points",
  });
});

/**
 * Reject pending resource (admin action)
 * Rejects resource with reason and notifies uploader
 * Updates resource status to 'rejected'
 *
 * @async
 * @param {Object} req - Express request (requires admin auth)
 * @param {string} req.params.id - Resource ID
 * @param {Object} req.body - { reason?: string } - Rejection reason
 * @param {Object} res - Express response
 * @returns {Object} - { message, resource_id }
 * @throws {Error} - 404 if resource not found or already reviewed
 */
exports.rejectResource = catchAsync(async (req, res) => {
  const { id } = req.params;
  const modId = req.user.portal_user_id;
  const { reason } = req.body;

  const { title, uploaderId } = await withTransaction(async (client) => {
    const resourceRes = await client.query(
      `UPDATE portal.resources
       SET status = 'rejected', rejection_reason = $2
       WHERE resource_id = $1 AND status = 'pending'
       RETURNING resource_id, title, created_by`,
      [id, reason || null],
    );

    if (resourceRes.rowCount === 0) {
      const error = new Error("Resource not found or already reviewed");
      error.statusCode = 404;
      throw error;
    }

    const { title, created_by: uploaderId } = resourceRes.rows[0];

    await client.query(
      `INSERT INTO portal.moderation_logs
         (admin_user_id, action_type, target_type, target_id)
       VALUES ($1, 'reject_resource', 'resource', $2)`,
      [modId, id],
    );

    return { title, uploaderId };
  });

  try {
    const reasonText = reason ? ` Reason: ${reason}` : "";
    await notify({
      userId: uploaderId,
      actorId: modId,
      type: "resource_rejected",
      title: "Resource Not Approved",
      message: `Your resource "${title}" was not approved.${reasonText}`,
      relatedType: "resource",
      relatedId: parseInt(id),
    });
  } catch (notifErr) {
    logger.warn({ err: notifErr }, "Resource rejection notification failed");
  }

  return res.json({ message: "Resource rejected" });
});

/**
 * Soft delete resource (user action)
 * Marks resource as deleted with timestamp, preserves data for audit
 * Only resource owner can delete their own resources
 *
 * @async
 * @param {Object} req - Express request (requires auth)
 * @param {string} req.params.id - Resource ID
 * @param {Object} req.user - { portal_user_id } - Current user
 * @param {Object} res - Express response
 * @returns {Object} - { message }
 * @throws {Error} - 403 if not resource owner, 404 if resource not found
 */
exports.softDeleteResource = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;
  const { reason } = req.body;

  const resource = await pool.query(
    `SELECT created_by FROM portal.resources
       WHERE resource_id = $1 AND deleted_at IS NULL`,
    [id],
  );

  if (!resource.rows.length) {
    return errorResponse(res, "Resource not found or already deleted", 404);
  }

  if (resource.rows[0].created_by !== userId) {
    return errorResponse(res, "Only the creator can delete this resource", 403);
  }

  const result = await pool.query(
    `UPDATE portal.resources
       SET deleted_at = NOW(), deleted_by = $1, deletion_reason = $2
       WHERE resource_id = $3
       RETURNING resource_id, title, deleted_at`,
    [userId, reason || "No reason provided", id],
  );

  return successResponse(
    res,
    result.rows[0],
    "Resource deleted successfully (soft delete)",
  );
});

exports.getAllResourcesAdmin = catchAsync(async (req, res) => {
  const {
    search,
    status,
    resource_type,
    program_id,
    semester,
    deleted, // 'all', 'exclude', 'only'
    sort = 'created_at_desc',
  } = req.query;

  const { page, limit, offset } = parsePagination(req.query, {
    defaultLimit: 20,
    maxLimit: 100,
  });

  const conditions = [];
  const params = [];

  // Deleted filter
  const delVal = deleted || 'all';
  if (delVal === 'exclude') {
    conditions.push("r.deleted_at IS NULL");
  } else if (delVal === 'only') {
    conditions.push("r.deleted_at IS NOT NULL");
  }

  // Status filter
  if (status && status !== 'all') {
    params.push(status);
    conditions.push(`r.status = $${params.length}`);
  }

  // Type filter
  if (resource_type && resource_type !== 'all') {
    params.push(resource_type);
    conditions.push(`r.resource_type = $${params.length}`);
  }

  // Program filter
  if (program_id && program_id !== 'all') {
    params.push(parseInt(program_id));
    conditions.push(`r.program_id = $${params.length}`);
  }

  // Semester filter
  if (semester && semester !== 'all') {
    params.push(parseInt(semester));
    conditions.push(`r.semester = $${params.length}`);
  }

  // Search filter
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(r.title ILIKE $${params.length} OR r.description ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Sort order
  let sortColumn = "r.created_at DESC";
  if (sort === "created_at_asc") sortColumn = "r.created_at ASC";
  else if (sort === "title_asc") sortColumn = "r.title ASC";
  else if (sort === "title_desc") sortColumn = "r.title DESC";

  const countQuery = `
    SELECT COUNT(*) FROM portal.resources r
    LEFT JOIN portal.users u ON u.user_id = r.created_by
    ${whereClause}
  `;

  const dataQuery = `
    SELECT
      r.*,
      u.user_id AS uploader_id,
      u.full_name AS uploader_name,
      a.email AS uploader_email,
      ad.degree_code AS degree_name,
      p.program_name
    FROM portal.resources r
    LEFT JOIN portal.users u ON u.user_id = r.created_by
    LEFT JOIN auth.users a ON a.auth_user_id = u.auth_user_id
    LEFT JOIN portal.academic_degrees ad ON ad.id = r.degree_id
    LEFT JOIN portal.programs p ON p.program_id = r.program_id
    ${whereClause}
    ORDER BY ${sortColumn}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const [countRes, dataRes] = await Promise.all([
    pool.query(countQuery, params),
    pool.query(dataQuery, [...params, limit, offset]),
  ]);

  // Fetch tags for these resources
  const resources = dataRes.rows;
  if (resources.length > 0) {
    const resourceIds = resources.map(r => r.resource_id);
    const tagsRes = await pool.query(
      `SELECT rt.resource_id, t.tag_id, t.name, t.slug, t.tag_type
       FROM portal.resource_tags rt
       JOIN portal.tags t ON t.tag_id = rt.tag_id
       WHERE rt.resource_id = ANY($1)`,
      [resourceIds]
    );

    // Map tags back to resources
    const tagsMap = {};
    tagsRes.rows.forEach(row => {
      if (!tagsMap[row.resource_id]) tagsMap[row.resource_id] = [];
      tagsMap[row.resource_id].push({
        tag_id: row.tag_id,
        name: row.name,
        slug: row.slug,
        tag_type: row.tag_type
      });
    });

    resources.forEach(r => {
      r.tags = tagsMap[r.resource_id] || [];
    });
  }

  const total = parseInt(countRes.rows[0].count);

  return res.json({
    success: true,
    data: resources,
    pagination: buildPaginationMeta({ total, page, limit }),
    totalPages: Math.ceil(total / limit),
  });
});

exports.createResourceAdmin = catchAsync(async (req, res) => {
  const adminId = req.user.portal_user_id;
  const {
    title,
    description,
    resource_type,
    program_id,
    semester,
    degree_id,
    url,
    difficulty_level = "beginner",
    status = "approved",
    system_tags: systemTagsRaw,
  } = req.body;

  const systemTagIds = parseSystemTagIds(systemTagsRaw);

  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const normalizedResourceType = typeof resource_type === "string" ? resource_type.trim().toLowerCase() : "";
  const normalizedUrl = typeof url === "string" ? url.trim() : "";

  if (!normalizedTitle || !normalizedResourceType) {
    return errorResponse(res, "title and resource_type are required", 400);
  }

  const parsedSemester = semester ? parseInt(semester) : null;
  const parsedProgramId = program_id ? parseInt(program_id) : null;
  const parsedDegreeId = degree_id ? parseInt(degree_id) : null;

  let fileUrl = null;
  let filePublicId = null;
  let originalFilename = null;

  if (normalizedResourceType === "link") {
    if (!normalizedUrl) {
      return errorResponse(res, "URL is required for link type", 400);
    }
    fileUrl = normalizedUrl;
  } else {
    if (req.file) {
      fileUrl = req.file.path;
      filePublicId = req.file.filename;
      originalFilename = req.file.originalname;
    } else if (normalizedUrl) {
      fileUrl = normalizedUrl;
    } else {
      return errorResponse(res, "File or URL is required", 400);
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO portal.resources
         (title, description, resource_type, program_id, semester, degree_id, url,
          file_url, file_public_id, original_filename, status, difficulty_level, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
       RETURNING *`,
      [
        normalizedTitle,
        description || null,
        normalizedResourceType,
        parsedProgramId,
        parsedSemester,
        parsedDegreeId,
        normalizedResourceType === "link" ? normalizedUrl : null,
        fileUrl,
        filePublicId,
        originalFilename,
        status || "approved",
        difficulty_level || "beginner",
        adminId,
      ]
    );

    const resourceId = result.rows[0].resource_id;

    await insertSystemTags(client, resourceId, systemTagIds);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Resource created successfully by Admin",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ err: error }, "Admin Resource upload failed");
    return errorResponse(res, "Failed to upload resource", 500);
  } finally {
    client.release();
  }
});

exports.updateResourceAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    resource_type,
    program_id,
    semester,
    degree_id,
    url,
    difficulty_level,
    status,
    rejection_reason,
    system_tags: systemTagsRaw,
  } = req.body;

  const systemTagIds = parseSystemTagIds(systemTagsRaw);

  // Get current resource state
  const currentRes = await pool.query(
    "SELECT * FROM portal.resources WHERE resource_id = $1",
    [id]
  );
  if (currentRes.rows.length === 0) {
    return errorResponse(res, "Resource not found", 404);
  }

  const current = currentRes.rows[0];

  let fileUrl = current.file_url;
  let filePublicId = current.file_public_id;
  let originalFilename = current.original_filename;

  const normalizedResourceType = resource_type || current.resource_type;

  if (normalizedResourceType === "link") {
    fileUrl = url || current.url || fileUrl;
  } else if (req.file) {
    fileUrl = req.file.path;
    filePublicId = req.file.filename;
    originalFilename = req.file.originalname;

    // Delete old Cloudinary file if it exists
    if (current.file_public_id) {
      try {
        const cloudinary = require("../config/cloudinary");
        await cloudinary.uploader.destroy(current.file_public_id);
      } catch (err) {
        logger.error({ err, pid: current.file_public_id }, "Cloudinary file replacement cleanup failed");
      }
    }
  } else if (url) {
    fileUrl = url;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE portal.resources
       SET title = COALESCE($1, title),
           description = $2,
           resource_type = $3,
           program_id = $4,
           semester = $5,
           degree_id = $6,
           url = $7,
           file_url = $8,
           file_public_id = $9,
           original_filename = $10,
           status = COALESCE($11, status),
           difficulty_level = COALESCE($12, difficulty_level),
           rejection_reason = $13
       WHERE resource_id = $14
       RETURNING *`,
      [
        title || current.title,
        description !== undefined ? description : current.description,
        normalizedResourceType,
        program_id !== undefined ? (program_id ? parseInt(program_id) : null) : current.program_id,
        semester !== undefined ? (semester ? parseInt(semester) : null) : current.semester,
        degree_id !== undefined ? (degree_id ? parseInt(degree_id) : null) : current.degree_id,
        normalizedResourceType === "link" ? (url || current.url) : null,
        fileUrl,
        filePublicId,
        originalFilename,
        status || current.status,
        difficulty_level || current.difficulty_level,
        rejection_reason !== undefined ? rejection_reason : current.rejection_reason,
        id
      ]
    );

    // Update tags: replace all existing with the new set
    await client.query("DELETE FROM portal.resource_tags WHERE resource_id = $1", [id]);
    await insertSystemTags(client, id, systemTagIds);

    await client.query("COMMIT");

    return res.json({
      success: true,
      message: "Resource updated successfully by Admin",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ err: error }, "Admin Resource update failed");
    return errorResponse(res, "Failed to update resource", 500);
  } finally {
    client.release();
  }
});

exports.deleteResourceAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.portal_user_id;
  const { hard } = req.query; // 'true' for hard delete, otherwise soft delete
  const { reason } = req.body;

  const currentRes = await pool.query(
    "SELECT * FROM portal.resources WHERE resource_id = $1",
    [id]
  );
  if (currentRes.rows.length === 0) {
    return errorResponse(res, "Resource not found", 404);
  }

  const current = currentRes.rows[0];

  if (hard === "true") {
    // Permanent deletion
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Delete tags mapping
      await client.query("DELETE FROM portal.resource_tags WHERE resource_id = $1", [id]);

      // Delete roadmap mappings
      await client.query("DELETE FROM portal.step_resource_map WHERE resource_id = $1", [id]);

      // Delete resource scores
      await client.query("DELETE FROM portal.resource_scores WHERE resource_id = $1", [id]);

      // Delete interactions
      await client.query("DELETE FROM portal.user_resource_interactions WHERE resource_id = $1", [id]);

      // Delete resource itself
      await client.query("DELETE FROM portal.resources WHERE resource_id = $1", [id]);

      // Delete from Cloudinary
      if (current.file_public_id) {
        try {
          const cloudinary = require("../config/cloudinary");
          await cloudinary.uploader.destroy(current.file_public_id);
        } catch (cloudinaryErr) {
          logger.error({ err: cloudinaryErr, pid: current.file_public_id }, "Cloudinary file cleanup failed in hard delete");
        }
      }

      await client.query("COMMIT");

      return successResponse(res, null, "Resource permanently hard deleted");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } else {
    // Soft deletion
    const result = await pool.query(
      `UPDATE portal.resources
       SET deleted_at = NOW(), deleted_by = $1, deletion_reason = $2
       WHERE resource_id = $3
       RETURNING *`,
      [adminId, reason || "Soft-deleted by administrator", id]
    );

    return successResponse(res, result.rows[0], "Resource successfully soft-deleted");
  }
});

exports.restoreResourceAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `UPDATE portal.resources
     SET deleted_at = NULL, deleted_by = NULL, deletion_reason = NULL
     WHERE resource_id = $1
     RETURNING *`,
    [id]
  );

  if (result.rows.length === 0) {
    return errorResponse(res, "Resource not found", 404);
  }

  return successResponse(res, result.rows[0], "Resource successfully restored");
});

