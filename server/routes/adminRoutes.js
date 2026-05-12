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
const adminReferenceController = require("../controllers/adminReferenceController");

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

router.patch(
  "/admin/discussions/:id/delete",
  verifyJWT,
  verifyAdmin,
  sanitizeInput,
  adminController.deleteDiscussion,
);

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

router.get("/admin/reference/it-fields", verifyJWT, verifyAdmin, adminReferenceController.itFields.getAll);
router.post("/admin/reference/it-fields", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.itFields.create);
router.put("/admin/reference/it-fields/:id", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.itFields.update);
router.delete("/admin/reference/it-fields/:id", verifyJWT, verifyAdmin, adminReferenceController.itFields.delete);

router.get("/admin/reference/academic-degrees", verifyJWT, verifyAdmin, adminReferenceController.academicDegrees.getAll);
router.post("/admin/reference/academic-degrees", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.academicDegrees.create);
router.put("/admin/reference/academic-degrees/:id", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.academicDegrees.update);
router.delete("/admin/reference/academic-degrees/:id", verifyJWT, verifyAdmin, adminReferenceController.academicDegrees.delete);

router.get("/admin/reference/job-market", verifyJWT, verifyAdmin, adminReferenceController.jobMarketInsights.getAll);
router.post("/admin/reference/job-market", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.jobMarketInsights.create);
router.put("/admin/reference/job-market/:id", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.jobMarketInsights.update);
router.delete("/admin/reference/job-market/:id", verifyJWT, verifyAdmin, adminReferenceController.jobMarketInsights.delete);

router.get("/admin/reference/it-clubs", verifyJWT, verifyAdmin, adminReferenceController.itClubs.getAll);
router.post("/admin/reference/it-clubs", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.itClubs.create);
router.put("/admin/reference/it-clubs/:id", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.itClubs.update);
router.delete("/admin/reference/it-clubs/:id", verifyJWT, verifyAdmin, adminReferenceController.itClubs.delete);

router.get("/admin/reference/programs", verifyJWT, verifyAdmin, adminReferenceController.programs.getAll);
router.post("/admin/reference/programs", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.programs.create);
router.put("/admin/reference/programs/:id", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.programs.update);
router.delete("/admin/reference/programs/:id", verifyJWT, verifyAdmin, adminReferenceController.programs.delete);

router.get("/admin/reference/tags", verifyJWT, verifyAdmin, adminReferenceController.tags.getAll);
router.post("/admin/reference/tags", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.tags.create);
router.put("/admin/reference/tags/:id", verifyJWT, verifyAdmin, sanitizeInput, adminReferenceController.tags.update);
router.delete("/admin/reference/tags/:id", verifyJWT, verifyAdmin, adminReferenceController.tags.delete);

module.exports = router;
