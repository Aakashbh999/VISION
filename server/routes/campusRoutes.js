const express = require("express");
const router = express.Router();
const campusController = require("../controllers/campusController");

// Public route to get active campuses for registration
router.get("/", campusController.getActiveCampuses);

module.exports = router;
