const pool = require("../config/db");
const { notify, feed } = require("../utils/activityService");
const { successResponse, errorResponse } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");
const {
  parsePagination,
  buildPaginationMeta,
} = require("../utils/pagination");
const { withTransaction } = require("../utils/withTransaction");

/**
 * Find an existing tag or create a new 'custom' type tag.
 * Accepts a pg pool or client (for use inside/outside transactions).
 * Returns the tag_id, or null if the name normalises to empty.
 */
async function getOrCreateCustomTag(db, name) {
  const clean = String(name).trim().slice(0, 50);
  if (!clean) return null;
  const slug = clean
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (!slug) return null;

  const existing = await db.query(
    `SELECT tag_id FROM portal.tags WHERE slug = $1 OR LOWER(name) = LOWER($2) LIMIT 1`,
    [slug, clean],
  );
  if (existing.rows.length > 0) return existing.rows[0].tag_id;

  const result = await db.query(
    `INSERT INTO portal.tags (name, slug, tag_type) VALUES ($1, $2, 'custom')
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
     RETURNING tag_id`,
    [clean, slug],
  );
  return result.rows[0].tag_id;
}

/* ===============================
   UPLOAD RESOURCE (User Contribution)
   Status defaults to 'pending' – awaits moderator approval
   Supports both file uploads (via Cloudinary) and external links

   Tag system (new):
   - system_tags: JSON array of tag IDs (max 5, must be tag_type = 'system')
   - custom_tags: JSON array of tag name strings (max 2, created as 'custom' if new)
   - Hashtags in descriptions are parsed for SEMESTER DETECTION ONLY — no tags
     are silently created from them. Tags must always be explicitly selected.
 ================================ */
/**
 * POST /api/resources
 * Body (multipart/form-data): title, description, resource_type, program_id, semester,
 *   degree_id, url (for links), file (for uploads),
 *   system_tags (JSON int array), custom_tags (JSON string array)
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
    custom_tags: customTagsRaw,
  } = req.body;
  const { extractHashtagsAndSemester } = require("../utils/hashtagUtils");

  // Extract semester hint from description hashtags (#Semester2 etc.) only.
  // Semester is the only useful signal — hashtags column doesn't exist on this DB.
  const { semester: extractedSemester } =
    extractHashtagsAndSemester(description);

  // --- Parse system tags (IDs referencing portal.tags where tag_type = 'system') ---
  let systemTagIds = [];
  if (systemTagsRaw) {
    try {
      const parsed = JSON.parse(systemTagsRaw);
      systemTagIds = Array.isArray(parsed)
        ? parsed.map(Number).filter((n) => Number.isInteger(n) && n > 0)
        : [];
    } catch (_) {
      systemTagIds = [];
    }
  }

  // --- Parse custom tags (free-text names, max 2) ---
  let customTagNames = [];
  if (customTagsRaw) {
    try {
      const parsed = JSON.parse(customTagsRaw);
      customTagNames = Array.isArray(parsed)
        ? parsed
            .map(String)
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    } catch (_) {
      customTagNames = [];
    }
  }

  // Enforce tag caps
  if (systemTagIds.length > 5) {
    return errorResponse(res, "You can select at most 5 system tags.", 400);
  }
  if (customTagNames.length > 2) {
    return errorResponse(res, "You can add at most 2 custom tags.", 400);
  }

  // Use extracted semester if not provided explicitly
  const finalSemester = semester || extractedSemester;
  const normalizedTitle = typeof title === "string" ? title.trim() : "";
  const normalizedDescription =
    typeof description === "string" ? description.trim() : "";
  const normalizedResourceType =
    typeof resource_type === "string" ? resource_type.trim().toLowerCase() : "";
  const normalizedUrl = typeof url === "string" ? url.trim() : "";
  const allowedResourceTypes = new Set(["notes", "book", "project", "link"]);

  // Validation
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

  // Fallback to user registration defaults if not provided
  const resolvedProgramId = program_id || req.user.program_id;
  const resolvedDegreeId = degree_id || req.user.academic_degree_id;

  const parsedProgramId =
    resolvedProgramId !== undefined && resolvedProgramId !== null && resolvedProgramId !== ""
      ? Number.parseInt(resolvedProgramId, 10)
      : null;
  const parsedDegreeId =
    resolvedDegreeId !== undefined && resolvedDegreeId !== null && resolvedDegreeId !== ""
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

    const finalStatus = (req.user.role === 'admin' && req.body.status === 'approved') ? 'approved' : 'pending';

    // Insert the resource row (no hashtags column on this deployment)
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

    // Link system tags (validate they exist as system-type to prevent spoofing)
    if (systemTagIds.length > 0) {
      const validCheck = await client.query(
        `SELECT tag_id FROM portal.tags WHERE tag_id = ANY($1) AND tag_type = 'system'`,
        [systemTagIds],
      );
      const validSystemIds = validCheck.rows.map((r) => r.tag_id);
      if (validSystemIds.length > 0) {
        const tagValues = validSystemIds
          .map((_, i) => `($1, $${i + 2})`)
          .join(", ");
        await client.query(
          `INSERT INTO portal.resource_tags (resource_id, tag_id) VALUES ${tagValues} ON CONFLICT DO NOTHING`,
          [resourceId, ...validSystemIds],
        );
      }
    }

    // Create & link custom tags
    for (const name of customTagNames) {
      const tagId = await getOrCreateCustomTag(client, name);
      if (tagId) {
        await client.query(
          `INSERT INTO portal.resource_tags (resource_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [resourceId, tagId],
        );
      }
    }

    await client.query("COMMIT");

    // Fetch the full resource data with joined fields to return to the frontend
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
      [resourceId]
    );

    res.status(201).json({
      success: true,
      message: finalStatus === 'approved' ? "Resource created and approved" : "Resource submitted for review",
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

/* ===============================
   GET ALL APPROVED RESOURCES (Public)
   Filters: program_id, semester, degree_id, resource_type, search
   Pagination: page, limit
 ================================ */
/**
 * GET /api/resources
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

  const { page: pageNum, limit: limitNum, offset } = parsePagination(req.query, {
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
    // Bridging logic for core programs (IDs 1-5)
    if (pId >= 1 && pId <= 5) {
      conditions.push(`(r.program_id = $${params.length} OR r.degree_id = $${params.length})`);
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
      // Broad check for PDFs: literal .pdf, or cloudinary raw upload, or default notes/book type where it's assumed to be PDF
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
  // NOTE: r.program_tag and r.hashtags columns do not exist on this deployment.
  // Those filters are intentionally omitted here.

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  // Count total for pagination
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM portal.resources r ${whereClause}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count);

  // Incorporate recommended scoring
  let selectAdditions = "";
  let joinAdditions = "";
  if (sort === "recommended" && req.user?.portal_user_id) {
    params.push(req.user.portal_user_id);
    selectAdditions = `, COALESCE(rs.score, 0) AS relevance_score`;
    joinAdditions = `LEFT JOIN portal.resource_scores rs ON rs.resource_id = r.resource_id AND rs.user_id = $${params.length}`;
  }

  // Fetch paginated results with degree name
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

  // If searching and no results found, return recommendations
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
      pagination: {
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0,
      },
    });
  }

  return res.json({
    data: result.rows,
    pagination: {
      ...buildPaginationMeta({ total, page: pageNum, limit: limitNum }),
    },
  });
});

/* ===============================
   GET MY RESOURCES (All Statuses)
 ================================ */
/**
 * GET /api/resources/my
 */
exports.getMyResources = catchAsync(async (req, res) => {
  const userId = req.user.portal_user_id;

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
       ORDER BY r.created_at DESC`,
    [userId],
  );

  return res.json(result.rows);
});

/* ===============================
   GET PENDING RESOURCES (Mod/Admin)
 ================================ */
/**
 * GET /api/admin/resources/pending
 */
exports.getPendingResources = catchAsync(async (req, res) => {
  const { search } = req.query;
  const { page: pageNum, limit: limitNum, offset } = parsePagination(req.query, {
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
    totalPages: Math.ceil(total / limitNum), // For backward compatibility
  });
});

/* ===============================
   APPROVE RESOURCE (Mod/Admin)
   Awards 10 reputation points to uploader + notification
 ================================ */
/**
 * PATCH /api/admin/resources/:id/approve
 */
exports.approveResource = catchAsync(async (req, res) => {
  const { id } = req.params;
  const modId = req.user.portal_user_id;
  const { title, uploaderId } = await withTransaction(async (client) => {

    // Update resource status
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

    // Award 10 reputation points to uploader
    await client.query(
      `UPDATE portal.users
       SET reputation_points = COALESCE(reputation_points, 0) + 10
       WHERE user_id = $1`,
      [uploaderId],
    );

    // Log in moderation_logs
    await client.query(
      `INSERT INTO portal.moderation_logs
         (admin_user_id, action_type, target_type, target_id)
       VALUES ($1, 'approve_resource', 'resource', $2)`,
      [modId, id],
    );
    return { title, uploaderId };
  });

  // Send notification (outside transaction – non-critical)
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

/* ===============================
   REJECT RESOURCE (Mod/Admin)
 ================================ */
/**
 * PATCH /api/admin/resources/:id/reject
 * Body: reason (optional)
 */
exports.rejectResource = catchAsync(async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const modId = req.user.portal_user_id;
    const { reason } = req.body;

    await client.query("BEGIN");

    const resourceRes = await client.query(
      `UPDATE portal.resources
       SET status = 'rejected', rejection_reason = $2
       WHERE resource_id = $1 AND status = 'pending'
       RETURNING resource_id, title, created_by`,
      [id, reason || null],
    );

    if (resourceRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return errorResponse(res, "Resource not found or already reviewed", 404);
    }

    const { title, created_by: uploaderId } = resourceRes.rows[0];

    // Log in moderation_logs
    await client.query(
      `INSERT INTO portal.moderation_logs
         (admin_user_id, action_type, target_type, target_id)
       VALUES ($1, 'reject_resource', 'resource', $2)`,
      [modId, id],
    );

    await client.query("COMMIT");

    // Notify uploader (non-critical)
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
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

/* ===============================
   SOFT DELETE RESOURCE (user-initiated)
   — records deletion + reason for moderation
 ================================ */
/**
 * POST /api/resources/:id/soft-delete
 * Body: reason (optional)
 */
exports.softDeleteResource = catchAsync(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.portal_user_id;
  const { reason } = req.body;

  // Verify resource exists and is not already deleted
  const resource = await pool.query(
    `SELECT created_by FROM portal.resources 
       WHERE resource_id = $1 AND deleted_at IS NULL`,
    [id],
  );

  if (!resource.rows.length) {
    return errorResponse(res, "Resource not found or already deleted", 404);
  }

  // Only creator can soft delete
  if (resource.rows[0].created_by !== userId) {
    return errorResponse(res, "Only the creator can delete this resource", 403);
  }

  // Soft delete: mark with deletion timestamp, user, and reason
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
