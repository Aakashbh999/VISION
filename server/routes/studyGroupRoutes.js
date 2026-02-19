const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/studyGroupController");
const {
  verifyJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");

// create
router.post("/", verifyJWT, requireApprovedStudent, ctrl.createGroup);

// join / leave
router.post(
  "/:groupId/join",
  verifyJWT,
  requireApprovedStudent,
  ctrl.joinGroup,
);
router.delete(
  "/:groupId/leave",
  verifyJWT,
  requireApprovedStudent,
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
  ctrl.createPost,
);
router.get("/:groupId/posts", verifyJWT, requireApprovedStudent, ctrl.getPosts);

module.exports = router;
