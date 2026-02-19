const pool = require("../config/db");

/* ===============================
   GET ALL GROUPS
================================ */
exports.getGroups = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        g.group_id,
        g.name,
        g.description,
        g.created_at,
        u.full_name AS creator,
        COUNT(gm.user_id) AS members
      FROM portal.groups g
      JOIN portal.users u ON u.user_id = g.created_by
      LEFT JOIN portal.group_members gm 
        ON gm.group_id = g.group_id
      GROUP BY g.group_id, u.full_name
      ORDER BY g.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

/* ===============================
   GROUP DETAILS
================================ */
exports.getGroupDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await pool.query(
      `
      SELECT 
        g.group_id,
        g.name,
        g.description,
        g.created_at,
        u.full_name AS creator,
        COUNT(gm.user_id) AS members
      FROM portal.groups g
      JOIN portal.users u ON u.user_id = g.created_by
      LEFT JOIN portal.group_members gm 
        ON gm.group_id = g.group_id
      WHERE g.group_id = $1
      GROUP BY g.group_id, u.full_name
    `,
      [id],
    );

    if (!group.rows.length) {
      return res.status(404).json({ error: "Group not found" });
    }

    res.json(group.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch group details" });
  }
};

/* ===============================
   CREATE GROUP
================================ */
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.portal_user_id;

    const group = await pool.query(
      `INSERT INTO portal.groups (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, userId],
    );

    res.json(group.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create group" });
  }
};

/* ===============================
   JOIN GROUP
================================ */
exports.joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    await pool.query(
      `INSERT INTO portal.group_members (group_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id, userId],
    );

    res.json({ message: "Joined group successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Join failed" });
  }
};

/* ===============================
   GET GROUP POSTS
================================ */
exports.getPosts = async (req, res) => {
  try {
    const { id } = req.params;

    const posts = await pool.query(
      `
      SELECT 
        gp.post_id,
        gp.content,
        gp.created_at,
        u.full_name
      FROM portal.group_posts gp
      JOIN portal.users u ON u.user_id = gp.user_id
      WHERE gp.group_id = $1
      ORDER BY gp.created_at DESC
    `,
      [id],
    );

    res.json(posts.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

/* ===============================
   CREATE POST
================================ */
exports.createPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.portal_user_id;

    await pool.query(
      `INSERT INTO portal.group_posts (group_id, user_id, content)
       VALUES ($1, $2, $3)`,
      [id, userId, content],
    );

    res.json({ message: "Post created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
};
