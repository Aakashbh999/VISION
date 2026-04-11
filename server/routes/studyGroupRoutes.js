const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studyGroupController");
const {
  verifyJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");

// create
router.post(
  "/",
  verifyJWT,
  requireApprovedStudent,
  sanitizeInput,
  ctrl.createGroup,
);

// join / leave
router.post(
  "/:groupId/join",
  verifyJWT,
  requireApprovedStudent,
  sanitizeInput,
  ctrl.joinGroup,
);
router.delete(
  "/:groupId/leave",
  verifyJWT,
  requireApprovedStudent,
  sanitizeInput,
  ctrl.leaveGroup,
);

// members
router.get(
  "/:groupId/members",
  verifyJWT,
  requireApprovedStudent,
  ctrl.getMembers,
);

// messages
router.post(
  "/:groupId/posts",
  verifyJWT,
  requireApprovedStudent,
  sanitizeInput,
  ctrl.createPost,
);
router.get("/:groupId/posts", verifyJWT, requireApprovedStudent, ctrl.getPosts);

module.exports = router;
