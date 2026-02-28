const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const {
  verifyJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");

router.post(
  "/reports",
  verifyJWT,
  requireApprovedStudent,
  reportController.reportContent,
);
