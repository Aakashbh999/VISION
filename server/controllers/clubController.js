const pool = require("../config/db");

/* ===============================
   GET CLUB DIRECTORY
================================ */
exports.getClubs = async (req, res) => {
  try {
    const { search, specialty, institution } = req.query;

    let query = `
      SELECT
        c.id,
        c.club_name,
        c.location,
        c.institution,
        c.specialty,
        c.is_public,  
        c.contact_info,
        c.slug,
        COUNT(cm.user_id) AS members
      FROM portal.it_clubs c
      LEFT JOIN portal.it_club_members cm
        ON cm.club_id = c.id
      WHERE (c.is_public IS NULL OR c.is_public = 'true' OR c.is_public = true)
    `;

    const values = [];
    let i = 1;

    if (search) {
      query += ` AND LOWER(c.club_name) LIKE LOWER($${i++})`;
      values.push(`%${search}%`);
    }

    if (specialty) {
      query += ` AND c.specialty = $${i++}`;
      values.push(specialty);
    }

    if (institution) {
      query += ` AND LOWER(c.institution) LIKE LOWER($${i++})`;
      values.push(`%${institution}%`);
    }

    query += `
      GROUP BY c.id
      ORDER BY members DESC, c.club_name
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
};

/* ===============================
   CLUB DETAILS
================================ */
exports.getClubDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const club = await pool.query(
      `SELECT id, slug, club_name, location, institution, specialty, is_public, contact_info
       FROM portal.it_clubs 
       WHERE id = $1 AND (is_public IS NULL OR is_public = 'true' OR is_public = true)`,
      [id],
    );

    if (!club.rows.length)
      return res.status(404).json({ error: "Club not found" });

    const members = await pool.query(
      `SELECT u.user_id, u.full_name
       FROM portal.it_club_members cm
       JOIN portal.users u ON u.user_id = cm.user_id
       WHERE cm.club_id = $1`,
      [id],
    );

    res.json({
      club: club.rows[0],
      members: members.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch club" });
  }
};

/* ===============================
   JOIN CLUB
================================ */
exports.joinClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    await pool.query(
      `INSERT INTO portal.it_club_members (club_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id, userId],
    );

    res.json({ message: "Joined club successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Join failed" });
  }
};

/* ===============================
   LEAVE CLUB
================================ */
exports.leaveClub = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.portal_user_id;

    await pool.query(
      `DELETE FROM portal.it_club_members
       WHERE club_id = $1 AND user_id = $2`,
      [id, userId],
    );

    res.json({ message: "Left club successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Leave failed" });
  }
};
