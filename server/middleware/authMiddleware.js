const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// 🔐 Restrict Portal Access Until Approved
exports.requireApprovedStudent = async (req, res, next) => {
  try {
    const { auth_user_id } = req.user;

    const result = await pool.query(
      `SELECT a.email_status, p.student_status
       FROM auth.users a
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       WHERE a.auth_user_id = $1`,
      [auth_user_id],
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "User not found" });

    const { email_status, student_status } = result.rows[0];

    if (email_status !== "verified")
      return res.status(403).json({ error: "Email not verified" });

    if (student_status !== "approved")
      return res.status(403).json({ error: "Awaiting admin approval" });

    next();
  } catch (err) {
    res.status(500).json({ error: "Authorization failed" });
  }
};
