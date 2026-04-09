const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middleware/authMiddleware");
const feedController = require("../controllers/feedController");

router.get("/", verifyJWT, feedController.getFeed);
router.get("/evaluation", verifyJWT, feedController.getFeedEvaluation);

module.exports = router;
