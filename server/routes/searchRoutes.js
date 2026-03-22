const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController");
const { optionalJWT } = require("../middleware/authMiddleware");

/**
 * Universal Search Routes
 * Provides weighted, multi-index search across the platform
 */

// GET /api/search - Universal search with weighted results
// Uses optionalJWT to get user context for personalized recommendations
router.get("/", optionalJWT, searchController.universalSearch);

// GET /api/search/suggestions - Quick autocomplete suggestions
router.get("/suggestions", optionalJWT, searchController.getSearchSuggestions);

module.exports = router;
