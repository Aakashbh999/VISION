const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/adminMiddleware");

router.get("/admin/pending", verifyAdmin, adminController.getPendingStudents);
router.patch(
  "/admin/approve/:user_id",
  verifyAdmin,
  adminController.approveStudent,
);
router.patch(
  "/admin/reject/:user_id",
  verifyAdmin,
  adminController.rejectStudent,
);

module.exports = router;
