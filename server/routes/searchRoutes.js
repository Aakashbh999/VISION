const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const { optionalJWT } = require("../middleware/authMiddleware");

router.get("/", optionalJWT, searchController.universalSearch);

router.get("/suggestions", optionalJWT, searchController.getSearchSuggestions);

module.exports = router;
