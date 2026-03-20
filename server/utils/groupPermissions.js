const pool = require("../config/db");
const {
  EMPTY_GROUP_PERMISSIONS,
  DEFAULT_CO_ADMIN_PERMISSIONS,
} = require("./constants");

/**
 * Normalizes user permissions based on their role
 * Owners get all co-admin permissions by default
 */
exports.normalizePermissions = (role, permissions) => {
  if (role === "owner") {
    return { ...DEFAULT_CO_ADMIN_PERMISSIONS };
  }
  return { ...EMPTY_GROUP_PERMISSIONS, ...(permissions || {}) };
};

/**
 * Checks if a membership object has a specific permission
 */
exports.hasGroupPermission = (membership, permissionKey) => {
  if (!membership) return false;
  if (membership.role === "owner") return true;
  if (membership.role !== "co_admin") return false;
  return membership.permissions?.[permissionKey] === true;
};

/**
 * Gets a user's membership and specific permissions for a group
 */
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
