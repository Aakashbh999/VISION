const express = require("express");
const router = express.Router();
const itController = require("../controllers/itController");

router.get("/it-fields", itController.getItFields);
router.get("/it-fields/:slug", itController.getItFieldBySlug);

router.get("/academic-degrees", itController.getDegrees);
router.get("/academic-degrees/:slug", itController.getDegreeBySlug);

router.get("/job-market", itController.getJobMarket);
router.get("/job-market/:slug", itController.getJobMarketBySlug);

router.get("/it-clubs", itController.getItClubs);
router.get("/it-clubs/:slug", itController.getItClubBySlug);

router.get("/tags/system", itController.getSystemTags);

module.exports = router;
