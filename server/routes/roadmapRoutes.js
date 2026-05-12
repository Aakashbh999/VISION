const express = require("express");
const router = express.Router();
const roadmapController = require("../controllers/roadmapController");
const { verifyJWT } = require("../middleware/authMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");

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

router.post(
  "/steps/:stepId/resources/:resourceId/visit",
  verifyJWT,
  roadmapController.trackResourceVisit,
);

router.get("/:id/path", verifyJWT, roadmapController.getRoadmapPath);

router.get("/:id/progress", verifyJWT, roadmapController.getRoadmapProgress);

router.get("/:id/status", verifyJWT, roadmapController.getEnrolmentStatus);
router.post("/:id/lock", verifyJWT, roadmapController.lockRoadmap);
router.post("/:id/leave", verifyJWT, roadmapController.leaveRoadmap);

module.exports = router;
