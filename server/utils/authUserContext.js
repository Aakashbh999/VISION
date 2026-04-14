const pool = require("../config/db");
const { resolveEffectiveSemester } = require("./academicUtils");

const AUTH_USER_CONTEXT_QUERY = `SELECT
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
  WHERE a.auth_user_id = $1`;

const mapUserContext = (authUserId, row) => {
  const effectiveSemester = resolveEffectiveSemester({
    semester: row.semester,
    batchYear: row.batch_year,
    semesterIsManual: row.semester_is_manual,
  });

  return {
    auth_user_id: authUserId,
    role: row.role,
    is_moderator: row.is_moderator === true,
    portal_user_id: row.user_id,
    student_status: row.student_status,
    email_status: row.email_status,
    program_id: row.program_id,
    batch_year: row.batch_year,
    semester_is_manual: row.semester_is_manual,
    current_semester: effectiveSemester,
    academic_degree_id: row.academic_degree_id,
    is_suspended: row.is_suspended === true,
  };
};

const loadAuthUserContext = async (authUserId) => {
  const { rows } = await pool.query(AUTH_USER_CONTEXT_QUERY, [authUserId]);
  if (!rows.length) {
    return null;
  }
  return mapUserContext(authUserId, rows[0]);
};

module.exports = {
  loadAuthUserContext,
};
