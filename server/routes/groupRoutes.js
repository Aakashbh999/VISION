const express = require("express");
const router = express.Router();
const controller = require("../controllers/groupController");
const {
  verifyJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");

// List all groups
router.get("/", verifyJWT, controller.getGroups);

// Group posts (more specific route first)
router.get("/:id/posts", verifyJWT, controller.getPosts);
router.post(
  "/:id/posts",
  verifyJWT,
  requireApprovedStudent,
  controller.createPost,
);

// Join group
router.post(
  "/:id/join",
  verifyJWT,
  requireApprovedStudent,
  controller.joinGroup,
);

// Group details (generic route last)
router.get("/:id", verifyJWT, controller.getGroupDetails);

module.exports = router;
