const express = require("express");
const router = express.Router();
const controller = require("../controllers/discussionController");
const {
  verifyJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");

router.get("/", verifyJWT, controller.getAllDiscussions);
router.get("/:id", verifyJWT, controller.getDiscussionDetails);

router.post(
  "/",
  verifyJWT,
  requireApprovedStudent,
  controller.createDiscussion,
);
router.post(
  "/:id/reply",
  verifyJWT,
  requireApprovedStudent,
  controller.replyDiscussion,
);
router.post(
  "/:id/like",
  verifyJWT,
  requireApprovedStudent,
  controller.toggleLike,
);

module.exports = router;
