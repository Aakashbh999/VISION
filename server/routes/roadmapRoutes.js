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

module.exports = router;
