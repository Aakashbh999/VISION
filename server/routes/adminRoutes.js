const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const resourceController = require("../controllers/resourceController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");
const { verifyModerator } = require("../middleware/moderatorMiddleware");

/* ===============================
   STUDENT MANAGEMENT
================================ */

router.get(
  "/admin/pending",
  verifyJWT,
  verifyAdmin,
  adminController.getPendingStudents,
);

router.get(
  "/admin/students",
  verifyJWT,
  verifyAdmin,
  adminController.getStudentsByStatus,
);

router.get(
  "/admin/stats",
  verifyJWT,
  verifyAdmin,
  adminController.getStudentStats,
);

router.patch(
  "/admin/approve/:user_id",
  verifyJWT,
  verifyAdmin,
  adminController.approveStudent,
);

router.patch(
  "/admin/reject/:user_id",
  verifyJWT,
  verifyAdmin,
  adminController.rejectStudent,
);

/* ===============================
   DISCUSSIONS
================================ */

router.patch(
  "/admin/discussions/:id/delete",
  verifyJWT,
  verifyAdmin,
  adminController.deleteDiscussion,
);

router.patch(
  "/admin/discussions/:id/restore",
  verifyJWT,
  verifyAdmin,
  adminController.restoreDiscussion,
);

router.delete(
  "/admin/discussions/:id/hard-delete",
  verifyJWT,
  verifyAdmin,
  adminController.hardDeleteDiscussion,
);

/* ===============================
   REPORTS
================================ */

router.get(
  "/admin/reports",
  verifyJWT,
  verifyAdmin,
  adminController.getReports,
);

router.patch(
  "/admin/reports/:id/close",
  verifyJWT,
  verifyAdmin,
  adminController.closeReport,
);

/* ===============================
   USER CONTROL
================================ */

router.patch(
  "/admin/suspend/:user_id",
  verifyJWT,
  verifyAdmin,
  adminController.suspendUser,
);

router.patch(
  "/admin/reactivate/:user_id",
  verifyJWT,
  verifyAdmin,
  adminController.reactivateUser,
);

/* ===============================
   DASHBOARD + LOGS
================================ */

router.get(
  "/admin/dashboard",
  verifyJWT,
  verifyAdmin,
  adminController.getAdminDashboard,
);

router.get(
  "/admin/logs",
  verifyJWT,
  verifyAdmin,
  adminController.getModerationLogs,
);

/* ===============================
   COMPREHENSIVE AUDIT LOGS
================================ */

router.get(
  "/admin/audit-logs",
  verifyJWT,
  verifyAdmin,
  adminController.getAuditLogs,
);

router.get(
  "/admin/audit-logs/summary",
  verifyJWT,
  verifyAdmin,
  adminController.getAuditLogsSummary,
);

router.get(
  "/admin/audit-logs/user/:userId",
  verifyJWT,
  verifyAdmin,
  adminController.getUserActivity,
);

/* ===============================
   SESSION MANAGEMENT
================================ */

router.get(
  "/admin/sessions",
  verifyJWT,
  verifyAdmin,
  adminController.getActiveSessions,
);

router.post(
  "/admin/users/:userId/force-logout",
  verifyJWT,
  verifyAdmin,
  adminController.forceLogoutUser,
);

/* ===============================
   RESOURCE MODERATION (admin OR moderator)
================================ */

router.get(
  "/admin/resources/pending",
  verifyJWT,
  verifyModerator,
  resourceController.getPendingResources,
);

router.patch(
  "/admin/resources/:id/approve",
  verifyJWT,
  verifyModerator,
  resourceController.approveResource,
);

router.patch(
  "/admin/resources/:id/reject",
  verifyJWT,
  verifyModerator,
  resourceController.rejectResource,
);

router.patch(
  "/admin/resources/:id/delete",
  verifyJWT,
  verifyAdmin,
  resourceController.adminSoftDeleteResource,
);

router.patch(
  "/admin/resources/:id/restore",
  verifyJWT,
  verifyAdmin,
  resourceController.restoreResource,
);

router.delete(
  "/admin/resources/:id/hard-delete",
  verifyJWT,
  verifyAdmin,
  resourceController.hardDeleteResource,
);

module.exports = router;

