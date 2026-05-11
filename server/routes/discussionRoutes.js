const express = require("express");
const router = express.Router();
const { verifyJWT, optionalJWT } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/discussionController");
const voteCtrl = require("../controllers/voteController");
const upload = require("../middleware/uploadMiddleware");
const rateLimit = require("express-rate-limit");
const sanitizeInput = require("../middleware/sanitizeInput");

const createLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { error: "Too many creations. Please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/", optionalJWT, ctrl.getAllDiscussions);
router.get("/tags", ctrl.getAllTags);
router.get("/specializations", ctrl.getSpecializations);
router.get("/degrees", ctrl.getDegrees);
router.get("/programs", ctrl.getPrograms);
router.get("/trending", ctrl.getTrendingDiscussions);

router.get("/user/defaults", verifyJWT, ctrl.getUserDefaults);
router.get("/user/my-posts", verifyJWT, ctrl.getMyPosts);
router.get("/user/saved", verifyJWT, ctrl.getSavedDiscussions);

router.get("/:id", optionalJWT, ctrl.getDiscussionDetails);

router.post(
  "/",
  verifyJWT,
  createLimiter,
  sanitizeInput,
  ctrl.createDiscussion,
);
router.put("/:id", verifyJWT, sanitizeInput, ctrl.updateDiscussion);
router.delete("/:id", verifyJWT, ctrl.deleteDiscussion);
router.delete("/:id/hard", verifyJWT, ctrl.hardDeleteDiscussion);
router.post("/:id/boost", verifyJWT, sanitizeInput, ctrl.boostDiscussion);
router.post(
  "/upload",
  verifyJWT,
  upload.single("file"),
  sanitizeInput,
  ctrl.uploadImage,
);

router.post(
  "/:id/comments",
  verifyJWT,
  createLimiter,
  sanitizeInput,
  ctrl.addComment,
);
router.delete("/comments/:commentId", verifyJWT, ctrl.deleteComment);
router.post(
  "/comments/:commentId/soft-delete",
  verifyJWT,
  sanitizeInput,
  ctrl.softDeleteComment,
);

router.post("/:id/vote", verifyJWT, sanitizeInput, voteCtrl.handleVote);
router.post("/:id/save", verifyJWT, sanitizeInput, ctrl.toggleSave);

router.post(
  "/comments/:id/vote",
  verifyJWT,
  sanitizeInput,
  voteCtrl.handleCommentVote,
);

module.exports = router;
