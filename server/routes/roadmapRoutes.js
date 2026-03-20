const express = require("express");
const router = express.Router();
const roadmapController = require("../controllers/roadmapController");
const { verifyJWT } = require("../middleware/authMiddleware");

// Protected (student must be logged in)
router.get("/", verifyJWT, roadmapController.getAllRoadmaps);
router.get("/:id", verifyJWT, roadmapController.getRoadmapDetails);
router.get(
  "/:id/steps/:stepId/resources",
  verifyJWT,
  roadmapController.getStepResources,
);
// Mark a step as completed
router.post(
  "/steps/:stepId/complete",
  verifyJWT,
  roadmapController.completeStep,
);

// Get roadmap path (subway map data)
router.get("/:id/path", verifyJWT, roadmapController.getRoadmapPath);

// Get progress for a roadmap
router.get("/:id/progress", verifyJWT, roadmapController.getRoadmapProgress);

module.exports = router;
