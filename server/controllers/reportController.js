const pool = require("../config/db");
const XPService = require("../services/xpService");
const logger = require("../utils/logger");

/**
 * Report Controller
 * Handles universal reporting and auto-moderation.
 */

// Create a report
exports.createReport = async (req, res) => {
  const { target_type, target_id, reason } = req.body;
  const reporterUserId = req.user.portal_user_id;
  const normalizedTargetId = parseInt(target_id, 10);

  if (!target_type || !target_id || !reason) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (Number.isNaN(normalizedTargetId)) {
    return res.status(400).json({ error: "Invalid target_id" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 0. Check for self-reporting and duplicate reports
    const checkResult = await client.query(
      `SELECT reporter_user_id, target_type, target_id FROM portal.reports 
            WHERE reporter_user_id = $1 AND target_type = $2 AND target_id = $3`,
      [reporterUserId, target_type, normalizedTargetId],
    );

    if (checkResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "You have already reported this item" });
    }

    // Check if user is reporting their own content
    let authorId;
    if (target_type === "discussion") {
      const discResult = await client.query(
        "SELECT user_id FROM portal.discussions WHERE discussion_id = $1",
        [normalizedTargetId],
      );
      authorId = discResult.rows[0]?.user_id;
    } else if (target_type === "comment") {
      const commResult = await client.query(
        "SELECT user_id FROM portal.discussion_comments WHERE comment_id = $1",
        [normalizedTargetId],
      );
      authorId = commResult.rows[0]?.user_id;
    }

    if (authorId === reporterUserId) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "You cannot report your own content" });
    }

    // 1. Insert the report
    const reportResult = await client.query(
      `INSERT INTO portal.reports (reporter_user_id, target_type, target_id, reason)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
      [reporterUserId, target_type, normalizedTargetId, reason],
    );

    // 2. Auto-Moderation Logic: Check report count for this target
    const countResult = await client.query(
      `SELECT COUNT(*) FROM portal.reports WHERE target_type = $1 AND target_id = $2 AND status = 'pending'`,
      [target_type, normalizedTargetId],
    );

    const reportCount = parseInt(countResult.rows[0].count);

    // 3. If 5+ reports, perform soft delete (set deleted_at)
    if (reportCount >= 5) {
      if (target_type === "discussion") {
        await client.query(
          `UPDATE portal.discussions SET deleted_at = NOW() WHERE discussion_id = $1`,
          [normalizedTargetId],
        );
      } else if (target_type === "comment") {
        await client.query(
          `UPDATE portal.discussion_comments SET deleted_at = NOW() WHERE comment_id = $1`,
          [normalizedTargetId],
        );
      }
      // Add other target types as needed (groups, resources)

      // Mark reports as resolved/hidden
      await client.query(
        `UPDATE portal.reports SET status = 'hidden' WHERE target_type = $1 AND target_id = $2`,
        [target_type, normalizedTargetId],
      );
    }

    await client.query("COMMIT");
    res.status(201).json({
      message: "Report submitted successfully",
      auto_mod: reportCount >= 5,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error({ err: error }, "Report controller error");
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};
