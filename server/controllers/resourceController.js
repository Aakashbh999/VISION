const pool = require("../config/db");
const { notify, feed } = require("../utils/activityService");
const { successResponse, errorResponse } = require("../utils/response");
const catchAsync = require("../utils/catchAsync");

/* ===============================
   UPLOAD RESOURCE (User Contribution)
   Status defaults to 'pending' – awaits moderator approval
   Supports both file uploads (via Cloudinary) and external links
 ================================ */
/**
 * POST /api/resources
 * Body (multipart/form-data): title, description, resource_type, program_id, semester, degree_id, url (for links), file (for uploads)
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
      url, // For link-type resources
      tags: tagsRaw, // Explicit tags from the TagInput UI (JSON string)
    } = req.body;
    const { extractHashtagsAndSemester } = require("../utils/hashtagUtils");

    // Extract hashtags and semester from description
    const { hashtags: extractedHashtags, semester: extractedSemester } =
      extractHashtagsAndSemester(description);

    // Parse explicit tags from frontend (sent as JSON string via FormData)
    let explicitTags = [];
    if (tagsRaw) {
      try {
        explicitTags = JSON.parse(tagsRaw);
      } catch (_) {
        explicitTags = [];
      }
    }

    // Merge explicit + extracted hashtags, deduplicate, normalize
    const mergedHashtags = [
      ...new Set([
        ...explicitTags
          .map((t) =>
            String(t)
              .toLowerCase()
              .replace(/^#+/, "")
              .replace(/[^a-z0-9_]/g, "")
              .slice(0, 30),
          )
          .filter(Boolean),
        ...(extractedHashtags || []).map((t) => t.toLowerCase()),
      ]),
    ].slice(0, 20);

    // Use extracted values if not provided explicitly
    const finalSemester = semester || extractedSemester;

    // Validation
    if (!title || !resource_type) {
      return errorResponse(res, "title and resource_type are required", 400);
    }

    let fileUrl = null;
    let filePublicId = null;
    let originalFilename = null;

    if (resource_type === "link") {
      if (!url) {
        return errorResponse(
          res,
          "URL is required for link-type resources",
          400,
        );
      }
      fileUrl = url;
    } else {
      if (req.file) {
        fileUrl = req.file.path;
        filePublicId = req.file.filename;
        originalFilename = req.file.originalname;
      } else if (url) {
        fileUrl = url;
      } else {
        return errorResponse(res, "File upload or URL is required", 400);
      }
    }

    const result = await pool.query(
      `INSERT INTO portal.resources
         (title, description, resource_type, program_id, semester, degree_id, url,
          file_url, file_public_id, original_filename, status, created_by, created_at, hashtags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11, NOW(), $12)
       RETURNING *`,
      [
        title,
        description || null,
        resource_type,
        program_id || null,
        finalSemester || null,
        degree_id || null,
        resource_type === "link" ? url : null,
        fileUrl,
        filePublicId,
        originalFilename,
        userId,
        mergedHashtags.length > 0 ? mergedHashtags : null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Resource submitted for review",
      data: result.rows[0],
    });
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
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    const conditions = ["r.status = 'approved'", "r.deleted_at IS NULL"];

    if (program_id) {
      params.push(parseInt(program_id));
      conditions.push(`r.program_id = $${params.length}`);
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
    if (program_tag) {
      params.push(program_tag);
      conditions.push(`r.program_tag = $${params.length}`);
    }
    if (hashtags) {
      const hashtagArray = Array.isArray(hashtags) ? hashtags : [hashtags];
      params.push(hashtagArray);
      conditions.push(`r.hashtags && $${params.length}`);
    }

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
    
    const orderByClause = (sort === "recommended" && req.user?.portal_user_id)
        ? "relevance_score DESC, r.created_at DESC"
        : search
        ? `similarity(r.title, $${params.indexOf(search) + 1}) DESC`
        : "r.created_at DESC";

    const result = await pool.query(
      `SELECT
         r.*,
         ad.full_name AS degree_name,
         p.program_name${selectAdditions}
       FROM portal.resources r
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
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
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
         ad.full_name AS degree_name,
         p.program_name
       FROM portal.resources r
       LEFT JOIN portal.academic_degrees ad ON ad.id = r.degree_id
       LEFT JOIN portal.programs p ON p.program_id = r.program_id
       WHERE r.created_by = $1 AND r.deleted_at IS NULL
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
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT
           r.*,
           u.full_name AS uploader_name,
           a.email    AS uploader_email,
           ad.full_name AS degree_name,
           p.program_name
         FROM portal.resources r
         JOIN portal.users u   ON u.user_id   = r.created_by
         JOIN auth.users a     ON a.auth_user_id = u.auth_user_id
         LEFT JOIN portal.academic_degrees ad ON ad.id = r.degree_id
         LEFT JOIN portal.programs p          ON p.program_id = r.program_id
         WHERE r.status = 'pending' AND r.deleted_at IS NULL
         ORDER BY r.created_at ASC
         LIMIT $1 OFFSET $2`,
        [limitNum, offset],
      ),
      pool.query(
        `SELECT COUNT(*) FROM portal.resources WHERE status = 'pending' AND deleted_at IS NULL`,
      ),
    ]);

    const total = parseInt(countResult.rows[0].count);

    return res.json({
      resources: dataResult.rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
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
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const modId = req.user.portal_user_id;

    await client.query("BEGIN");

    // Update resource status
    const resourceRes = await client.query(
      `UPDATE portal.resources
       SET status = 'approved'
       WHERE resource_id = $1 AND status = 'pending'
       RETURNING resource_id, title, created_by`,
      [id],
    );

    if (resourceRes.rowCount === 0) {
      await client.query("ROLLBACK");
      return errorResponse(res, "Resource not found or already reviewed", 404);
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

    await client.query("COMMIT");

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
      console.error("Notification failed (non-fatal):", notifErr.message);
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
      console.error("Resource feed event failed (non-fatal):", feedErr.message);
    }

    return res.json({
      message: "Resource approved and uploader awarded 10 reputation points",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
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
       SET status = 'rejected'
       WHERE resource_id = $1 AND status = 'pending'
       RETURNING resource_id, title, created_by`,
      [id],
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
      console.error("Notification failed (non-fatal):", notifErr.message);
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
      return errorResponse(
        res,
        "Only the creator can delete this resource",
        403,
      );
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
