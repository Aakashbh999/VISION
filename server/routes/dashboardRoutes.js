const express = require("express");
const router = express.Router();
const controller = require("../controllers/dashboardController");
const {
  verifyJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");

router.get("/", verifyJWT, requireApprovedStudent, controller.getDashboard);

module.exports = router;
