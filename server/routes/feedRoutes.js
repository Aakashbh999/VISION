    const express = require("express");
    const router = express.Router();
    const { verifyJWT } = require("../middleware/authMiddleware");
    const feedController = require("../controllers/feedController");

    router.get("/", verifyJWT, feedController.getFeed);

    module.exports = router;
