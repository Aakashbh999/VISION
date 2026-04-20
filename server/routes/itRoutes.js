const express = require("express");
const router = express.Router();
const itController = require("../controllers/itController");

// IT Fields - List and Detail
router.get("/it-fields", itController.getItFields);
router.get("/it-fields/:slug", itController.getItFieldBySlug);

// Academic Degrees - List and Detail
router.get("/academic-degrees", itController.getDegrees);
router.get("/academic-degrees/:slug", itController.getDegreeBySlug);

// Job Market - List and Detail
router.get("/job-market", itController.getJobMarket);
router.get("/job-market/:slug", itController.getJobMarketBySlug);

// IT Clubs - List and Detail
router.get("/it-clubs", itController.getItClubs);
router.get("/it-clubs/:slug", itController.getItClubBySlug);

// System Tags
router.get("/tags/system", itController.getSystemTags);

module.exports = router;
