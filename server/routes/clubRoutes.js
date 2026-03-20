const express = require("express");
const router = express.Router();
const controller = require("../controllers/clubController");
const { verifyJWT } = require("../middleware/authMiddleware");

// Club directory (public listing)
router.get("/", verifyJWT, controller.getClubs);

// Get available specialties for filtering
router.get("/specialties", verifyJWT, controller.getSpecialties);

// Club profile details
router.get("/:id", verifyJWT, controller.getClubDetails);

// Note: Join/Leave endpoints removed - membership managed externally

module.exports = router;
