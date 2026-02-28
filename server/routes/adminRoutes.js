const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { verifyJWT } = require("../middleware/authMiddleware"); // adjust path if needed
const { verifyAdmin } = require("../middleware/adminMiddleware");

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

module.exports = router;
