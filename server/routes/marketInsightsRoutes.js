/**
 * Market Insights Routes
 * Public API endpoints for job market analytics
 */

const express = require("express");
const router = express.Router();
const marketInsightsController = require("../controllers/marketInsightsController");

// ============================================
// Public Routes - No Auth Required
// ============================================

// Market Statistics Overview
router.get("/stats", marketInsightsController.getMarketStats);

// Trending Fields
router.get("/trending", marketInsightsController.getTrendingFields);

// All Skills (for filter dropdowns)
router.get("/skills", marketInsightsController.getSkills);

// Compare Two Fields
router.get("/compare", marketInsightsController.compareFields);

// Search/Filter Jobs
router.get("/jobs", marketInsightsController.searchJobs);

// All Fields with Analytics
router.get("/fields", marketInsightsController.getFields);

// Field Details
router.get("/fields/:id", marketInsightsController.getFieldOverview);
router.get("/fields/:id/skills", marketInsightsController.getFieldSkills);
router.get("/fields/:id/salary", marketInsightsController.getFieldSalary);

module.exports = router;
