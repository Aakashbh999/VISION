const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const resourceController = require("../controllers/resourceController");
const adminRoadmapController = require("../controllers/adminRoadmapController");
const { verifyJWT } = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/adminMiddleware");
const { verifyModerator } = require("../middleware/moderatorMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");
const campusController = require("../controllers/campusController");

/* ===============================
   CAMPUS MANAGEMENT
================================ */

router.get(
  "/admin/campuses",
  verifyJWT,
  verifyAdmin,
  campusController.getAllCampuses
);

router.post(
  "/admin/campuses",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  campusController.createCampus
);

router.put(
  "/admin/campuses/:campus_id",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  campusController.updateCampus
);

router.delete(
  "/admin/campuses/:campus_id",
  verifyJWT,
  verifyAdmin,
  campusController.deleteCampus
);

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
  sanitizeInput,
  adminController.approveStudent,
);

router.patch(
  "/admin/reject/:user_id",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminController.rejectStudent,
);

/* ===============================
   REGISTRATION WHITELIST
================================ */

router.get(
  "/admin/registration-whitelist",
  verifyJWT,
  verifyAdmin,
  adminController.getRegistrationWhitelists,
);

router.post(
  "/admin/registration-whitelist",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminController.addRegistrationWhitelist,
);

router.put(
  "/admin/registration-whitelist/:registration_number",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminController.updateRegistrationWhitelist,
);

router.delete(
  "/admin/registration-whitelist/:registration_number",
  verifyJWT,
  verifyAdmin,
  adminController.deleteRegistrationWhitelist,
);


/* ===============================
   DISCUSSIONS
================================ */

router.patch(
  "/admin/discussions/:id/delete",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminController.deleteDiscussion,
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
  sanitizeInput,
  adminController.closeReport,
);

/* ===============================
   USER CONTROL
================================ */

router.patch(
  "/admin/suspend/:user_id",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminController.suspendUser,
);

router.patch(
  "/admin/reactivate/:user_id",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
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
  sanitizeInput,
  adminController.forceLogoutUser,
);

/* ===============================
   ROADMAP MANAGEMENT (Admin)
================================ */

router.get(
  "/admin/roadmaps",
  verifyJWT,
  verifyAdmin,
  adminRoadmapController.getAllAdminRoadmaps,
);

router.get(
  "/admin/roadmaps/:id",
  verifyJWT,
  verifyAdmin,
  adminRoadmapController.getAdminRoadmapById,
);

router.post(
  "/admin/roadmaps",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminRoadmapController.createRoadmap,
);

router.put(
  "/admin/roadmaps/:id",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminRoadmapController.updateRoadmap,
);

router.delete(
  "/admin/roadmaps/:id",
  verifyJWT,
  verifyAdmin,
  adminRoadmapController.softDeleteRoadmap,
);

router.post(
  "/admin/roadmaps/:roadmapId/steps",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminRoadmapController.addStep,
);

router.put(
  "/admin/roadmaps/steps/:stepId",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminRoadmapController.updateStep,
);

router.delete(
  "/admin/roadmaps/steps/:stepId",
  verifyJWT,
  verifyAdmin,
  adminRoadmapController.softDeleteStep,
);

router.patch(
  "/admin/roadmaps/steps/:stepId/reorder",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminRoadmapController.reorderStep,
);

router.post(
  "/admin/roadmaps/steps/:stepId/resources",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminRoadmapController.addResourceToStep,
);

router.delete(
  "/admin/roadmaps/steps/:stepId/resources/:resourceId",
  verifyJWT,
  verifyAdmin,
  adminRoadmapController.removeResourceFromStep,
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
  sanitizeInput,
  resourceController.approveResource,
);

router.patch(
  "/admin/resources/:id/reject",
  verifyJWT,
  verifyModerator,
  sanitizeInput,
  resourceController.rejectResource,
);

/* ===============================
   PERMANENT DELETION (Admin Only)
================================ */

router.delete(
  "/admin/content",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminController.hardDeleteContent,
);

router.delete(
  "/admin/users/:user_id",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminController.hardDeleteUser,
);

router.post(
  "/admin/reports/:report_id/resolve",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminController.resolveReportWithAction,
);

router.get(
  "/admin/reports/:report_id/examine",
  verifyJWT,
  verifyAdmin,
  adminController.examineReportContent,
);

module.exports = router;
