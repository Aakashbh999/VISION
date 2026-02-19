const express = require("express");
const router = express.Router();
const controller = require("../controllers/clubController");
const {
  verifyJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");

// Club directory
router.get("/", verifyJWT, controller.getClubs);

// Club details
router.get("/:id", verifyJWT, controller.getClubDetails);

// Join club
router.post(
  "/:id/join",
  verifyJWT,
  requireApprovedStudent,
  controller.joinClub,
);

// Leave club
router.delete(
  "/:id/leave",
  verifyJWT,
  requireApprovedStudent,
  controller.leaveClub,
);

module.exports = router;
