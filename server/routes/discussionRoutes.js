const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/discussionController");

router.get("/", ctrl.getAllDiscussions);
router.get("/:id", ctrl.getDiscussionDetails);

router.post("/", verifyJWT, ctrl.createDiscussion);
router.post("/:id/reply", verifyJWT, ctrl.replyDiscussion);
router.post("/:id/like", verifyJWT, ctrl.toggleLike);

module.exports = router;
