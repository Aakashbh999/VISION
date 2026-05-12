

const express = require("express");
const router = express.Router();
const marketInsightsController = require("../controllers/marketInsightsController");

router.get("/stats", marketInsightsController.getMarketStats);

router.get("/trending", marketInsightsController.getTrendingFields);

router.get("/skills", marketInsightsController.getSkills);

router.get("/compare", marketInsightsController.compareFields);

router.get("/jobs", marketInsightsController.searchJobs);

router.get("/fields", marketInsightsController.getFields);

router.get("/fields/:id", marketInsightsController.getFieldOverview);
router.get("/fields/:id/skills", marketInsightsController.getFieldSkills);
router.get("/fields/:id/salary", marketInsightsController.getFieldSalary);

module.exports = router;
