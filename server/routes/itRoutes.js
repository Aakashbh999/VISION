const express = require("express");
const router = express.Router();
const itController = require("../controllers/itController");

// Map the URLs to the Controller functions
router.get("/it-fields", itController.getItFields);
router.get("/academic-degrees", itController.getDegrees);
router.get("/job-market", itController.getJobMarket);
router.get("/it-clubs", itController.getItClubs);

module.exports = router;
