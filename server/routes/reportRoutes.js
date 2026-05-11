const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { verifyJWT } = require("../middleware/authMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");

router.post("/", verifyJWT, sanitizeInput, reportController.createReport);

module.exports = router;
