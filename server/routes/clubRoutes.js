const express = require("express");
const router = express.Router();
const controller = require("../controllers/clubController");
const { verifyJWT } = require("../middleware/authMiddleware");

router.get("/", verifyJWT, controller.getClubs);

router.get("/specialties", verifyJWT, controller.getSpecialties);

router.get("/:id", verifyJWT, controller.getClubDetails);

module.exports = router;
