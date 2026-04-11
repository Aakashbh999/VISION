const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyJWT } = require("../middleware/authMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");

router.get("/me", verifyJWT, userController.getMe);
router.post(
  "/users/presence",
  verifyJWT,
  sanitizeInput,
  userController.updatePresence,
);
router.get("/users/stats", verifyJWT, userController.getUserStats);

module.exports = router;
