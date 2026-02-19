const pool = require("../config/db");

/* ===============================
   GET ALL DISCUSSIONS
================================ */
exports.getAllDiscussions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.discussion_id,
        d.title,
        d.created_at,
        u.full_name AS author,
        COUNT(dl.user_id) AS likes
      FROM portal.discussions d
      JOIN portal.users u ON u.user_id = d.user_id
      LEFT JOIN portal.discussion_likes dl
        ON dl.discussion_id = d.discussion_id
      GROUP BY d.discussion_id, u.full_name
      ORDER BY d.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch discussions" });
  }
};

/* ===============================
   DISCUSSION DETAILS
================================ */
exports.getDiscussionDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await pool.query(
      `SELECT d.*, u.full_name AS author
       FROM portal.discussions d
       JOIN portal.users u ON u.user_id = d.user_id
       WHERE d.discussion_id = $1`,
      [id],
    );

    if (!discussion.rows.length)
      return res.status(404).json({ error: "Discussion not found" });

    const replies = await pool.query(
      `SELECT r.reply_id, r.content, r.created_at, u.full_name
       FROM portal.discussion_replies r
       JOIN portal.users u ON u.user_id = r.user_id
       WHERE r.discussion_id = $1
       ORDER BY r.created_at`,
      [id],
    );

    res.json({
      discussion: discussion.rows[0],
      replies: replies.rows,
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
    const { title, content } = req.body;
    const userId = req.user.portal_user_id;

    const result = await pool.query(
      `INSERT INTO portal.discussions (user_id, title, content)
       VALUES ($1,$2,$3) RETURNING *`,
      [userId, title, content],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create discussion" });
  }
};

/* ===============================
   REPLY
================================ */
exports.replyDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.portal_user_id;

    await pool.query(
      `INSERT INTO portal.discussion_replies (discussion_id,user_id,content)
       VALUES ($1,$2,$3)`,
      [id, userId, content],
    );

    res.json({ message: "Reply added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reply" });
  }
};

/* ===============================
   TOGGLE LIKE
================================ */
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    const exists = await pool.query(
      `SELECT 1 FROM portal.discussion_likes
       WHERE discussion_id=$1 AND user_id=$2`,
      [id, userId],
    );

    if (exists.rows.length) {
      await pool.query(
        `DELETE FROM portal.discussion_likes
         WHERE discussion_id=$1 AND user_id=$2`,
        [id, userId],
      );
      return res.json({ liked: false });
    }

    await pool.query(
      `INSERT INTO portal.discussion_likes (discussion_id,user_id)
       VALUES ($1,$2)`,
      [id, userId],
    );

    res.json({ liked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Like failed" });
  }
};
