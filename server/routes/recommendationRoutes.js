const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middleware/authMiddleware");
const recommendationController = require("../controllers/recommendationController");

router.get("/", verifyJWT, recommendationController.getRecommendations);

module.exports = router;
