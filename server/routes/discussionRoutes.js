const express = require("express");
const router = express.Router();
const { verifyJWT, optionalJWT } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/discussionController");

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
router.post("/", verifyJWT, ctrl.createDiscussion);
router.put("/:id", verifyJWT, ctrl.updateDiscussion);
router.delete("/:id", verifyJWT, ctrl.deleteDiscussion);

// Comments (renamed from replies)
router.post("/:id/comments", verifyJWT, ctrl.addComment);
router.delete("/comments/:commentId", verifyJWT, ctrl.deleteComment);

// Like and Save
router.post("/:id/like", verifyJWT, ctrl.toggleLike);
router.post("/:id/save", verifyJWT, ctrl.toggleSave);

module.exports = router;
