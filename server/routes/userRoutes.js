const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyJWT } = require("../middleware/authMiddleware");

router.get("/me", verifyJWT, userController.getMe);

module.exports = router;
