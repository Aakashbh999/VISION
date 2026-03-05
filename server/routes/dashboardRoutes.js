const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboardController");
const {
  verifyJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");

// Dashboard endpoint
router.get("/", verifyJWT, requireApprovedStudent, controller.getDashboard);

module.exports = router;
