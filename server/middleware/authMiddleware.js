const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { resolveEffectiveSemester } = require("../utils/academicUtils");
const env = require("../config/env");
const logger = require("../utils/logger");

exports.verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const userData = await pool.query(
      `SELECT 
         p.user_id,
         p.student_status,
         p.is_suspended,
         p.is_moderator,
         p.program_id,
         p.semester,
         p.batch_year,
         p.semester_is_manual,
         p.academic_degree_id,
         a.email_status,
         a.role
       FROM auth.users a
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       WHERE a.auth_user_id = $1`,
      [decoded.auth_user_id],
    );

    if (!userData.rows.length) {
      return res.status(401).json({ error: "User not found" });
    }

    const {
      user_id,
      student_status,
      email_status,
      is_suspended,
      role,
      is_moderator,
      program_id,
      semester,
      batch_year,
      semester_is_manual,
      academic_degree_id,
    } = userData.rows[0];

    const effectiveSemester = resolveEffectiveSemester({
      semester,
      batchYear: batch_year,
      semesterIsManual: semester_is_manual,
    });

    if (is_suspended) {
      return res.status(403).json({
        error: "Your account has been suspended. Contact admin.",
      });
    }

    req.user = {
      auth_user_id: decoded.auth_user_id,
      role,
      is_moderator: is_moderator === true,
      portal_user_id: user_id,
      student_status,
      email_status,
      program_id,
      batch_year,
      semester_is_manual,
      current_semester: effectiveSemester,
      academic_degree_id,
    };

    next();
  } catch (err) {
    logger.warn({ err }, "JWT verification failed");
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

// 🔓 Optional JWT - continues without auth if no token provided
exports.optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // No token provided - continue as unauthenticated
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const userData = await pool.query(
      `SELECT 
         p.user_id,
         p.student_status,
         p.is_suspended,
         p.is_moderator,
         p.program_id,
         p.semester,
         p.batch_year,
         p.semester_is_manual,
         p.academic_degree_id,
         a.email_status,
         a.role
       FROM auth.users a
       JOIN portal.users p ON a.auth_user_id = p.auth_user_id
       WHERE a.auth_user_id = $1`,
      [decoded.auth_user_id],
    );

    if (!userData.rows.length) {
      req.user = null;
      return next();
    }

    const {
      user_id,
      student_status,
      email_status,
      is_suspended,
      role,
      is_moderator,
      program_id,
      semester,
      batch_year,
      semester_is_manual,
      academic_degree_id,
    } = userData.rows[0];

    const effectiveSemester = resolveEffectiveSemester({
      semester,
      batchYear: batch_year,
      semesterIsManual: semester_is_manual,
    });

    if (is_suspended) {
      req.user = null;
      return next();
    }

    req.user = {
      auth_user_id: decoded.auth_user_id,
      role,
      is_moderator: is_moderator === true,
      portal_user_id: user_id,
      student_status,
      email_status,
      program_id,
      batch_year,
      semester_is_manual,
      current_semester: effectiveSemester,
      academic_degree_id,
    };

    next();
  } catch (err) {
    // Token invalid - continue as unauthenticated
    req.user = null;
    next();
  }
};
