const express = require("express");
const router = express.Router();
const { verifyJWT, optionalJWT } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/discussionController");
const voteCtrl = require("../controllers/voteController");
const upload = require("../middleware/uploadMiddleware");
const rateLimit = require("express-rate-limit");

// Anti-spam limiter: 5 creations per 1 minute
const createLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { error: "Too many creations. Please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes (optional auth for personalization)
router.get("/", optionalJWT, ctrl.getAllDiscussions);
router.get("/tags", ctrl.getAllTags);
router.get("/specializations", ctrl.getSpecializations);
router.get("/degrees", ctrl.getDegrees);
router.get("/trending", ctrl.getTrendingDiscussions);

// Protected routes - must come before /:id
router.get("/user/defaults", verifyJWT, ctrl.getUserDefaults);
router.get("/user/my-posts", verifyJWT, ctrl.getMyPosts);
router.get("/user/saved", verifyJWT, ctrl.getSavedDiscussions);

// Discussion details - parameterized route comes AFTER specific routes
router.get("/:id", optionalJWT, ctrl.getDiscussionDetails);

// Protected routes
router.post("/", verifyJWT, createLimiter, ctrl.createDiscussion);
router.put("/:id", verifyJWT, ctrl.updateDiscussion);
router.delete("/:id", verifyJWT, ctrl.deleteDiscussion);
router.delete("/:id/hard", verifyJWT, ctrl.hardDeleteDiscussion);
router.post("/:id/boost", verifyJWT, ctrl.boostDiscussion);
router.post("/upload", verifyJWT, upload.single("file"), ctrl.uploadImage);

// Comments (renamed from replies)
router.post("/:id/comments", verifyJWT, createLimiter, ctrl.addComment);
router.delete("/comments/:commentId", verifyJWT, ctrl.deleteComment);
router.post(
  "/comments/:commentId/soft-delete",
  verifyJWT,
  ctrl.softDeleteComment,
);

// Like and Save
router.post("/:id/vote", verifyJWT, voteCtrl.handleVote);
router.post("/:id/save", verifyJWT, ctrl.toggleSave);

// Comment Likes
router.post("/comments/:id/vote", verifyJWT, voteCtrl.handleCommentVote);

module.exports = router;
