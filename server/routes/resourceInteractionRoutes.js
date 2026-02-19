const express = require("express");
const router = express.Router();
const {
  verifyJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");
const interactionController = require("../controllers/resourceInteractionController");

router.post(
  "/resources/:id/interact",
  verifyJWT,
  requireApprovedStudent,
  interactionController.interactWithResource,
);

module.exports = router;
