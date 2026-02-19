const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/adminMiddleware");

// Get all pending students
router.get("/admin/pending", verifyAdmin, adminController.getPendingStudents);

// Get students by status (?status=approved)
router.get("/admin/students", verifyAdmin, adminController.getStudentsByStatus);

// Student statistics
router.get("/admin/stats", verifyAdmin, adminController.getStudentStats);

// Approve student
router.patch(
  "/admin/approve/:user_id",
  verifyAdmin,
  adminController.approveStudent,
);

// Reject student
router.patch(
  "/admin/reject/:user_id",
  verifyAdmin,
  adminController.rejectStudent,
);

module.exports = router;
