const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyJWT } = require("../middleware/authMiddleware");

router.get("/me", verifyJWT, userController.getMe);
router.get("/users/stats", verifyJWT, userController.getUserStats);

module.exports = router;
