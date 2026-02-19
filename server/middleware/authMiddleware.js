const jwt = require("jsonwebtoken");
const pool = require("../config/db");

exports.verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user data
    const userData = await pool.query(
      `SELECT 
         p.user_id,
         p.student_status,
         a.email_status
       FROM auth.users a
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       WHERE a.auth_user_id = $1`,
      [decoded.auth_user_id],
    );

    if (!userData.rows.length) {
      return res.status(401).json({ error: "User not found" });
    }

    const { user_id, student_status, email_status } = userData.rows[0];

    req.user = {
      auth_user_id: decoded.auth_user_id,
      role: decoded.role,
      portal_user_id: user_id,
      student_status,
      email_status,
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

// 🔐 Restrict Portal Access Until Approved
exports.requireApprovedStudent = (req, res, next) => {
  const { email_status, student_status } = req.user;

  if (email_status !== "verified") {
    return res.status(403).json({ error: "Email not verified" });
  }

  if (student_status !== "approved") {
    return res.status(403).json({ error: "Awaiting admin approval" });
  }

  next();
};
