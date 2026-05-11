const pool = require("../config/db");
const {
  EMPTY_GROUP_PERMISSIONS,
  DEFAULT_CO_ADMIN_PERMISSIONS,
} = require("./constants");

exports.normalizePermissions = (role, permissions) => {
  if (role === "owner") {
    return { ...DEFAULT_CO_ADMIN_PERMISSIONS };
  }
  return { ...EMPTY_GROUP_PERMISSIONS, ...(permissions || {}) };
};

exports.hasGroupPermission = (membership, permissionKey) => {
  if (!membership) return false;
  if (membership.role === "owner") return true;
  if (membership.role !== "co_admin") return false;
  return membership.permissions?.[permissionKey] === true;
};

exports.getMembership = async (groupId, userId) => {
  if (!userId) return null;

  const membership = await pool.query(
    `SELECT role, permissions FROM portal.group_members WHERE group_id = $1 AND user_id = $2`,
    [groupId, userId],
  );

  if (!membership.rows.length) return null;

  const row = membership.rows[0];
  return {
    role: row.role,
    permissions: exports.normalizePermissions(row.role, row.permissions),
  };
};
