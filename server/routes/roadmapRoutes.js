const express = require("express");
const router = express.Router();
const roadmapController = require("../controllers/roadmapController");
const { verifyJWT } = require("../middleware/authMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");

// Protected (student must be logged in)
router.get("/", verifyJWT, roadmapController.getAllRoadmaps);
router.get("/:id", verifyJWT, roadmapController.getRoadmapDetails);
router.get(
  "/:id/steps/:stepId/resources",
  verifyJWT,
  roadmapController.getStepResources,
);
router.post(
  "/steps/:stepId/complete",
  verifyJWT,
  sanitizeInput,
  roadmapController.completeStep,
);

// Track resource interaction
router.post(
  "/steps/:stepId/resources/:resourceId/visit",
  verifyJWT,
  roadmapController.trackResourceVisit,
);

// Get roadmap path (subway map data)
router.get("/:id/path", verifyJWT, roadmapController.getRoadmapPath);

// Get progress for a roadmap
router.get("/:id/progress", verifyJWT, roadmapController.getRoadmapProgress);

// Enrolment & Anti-Spam
router.get("/:id/status", verifyJWT, roadmapController.getEnrolmentStatus);
router.post("/:id/leave", verifyJWT, roadmapController.leaveRoadmap);

module.exports = router;
