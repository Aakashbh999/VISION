/**
 * Market Insights Controller
 * Handles HTTP requests for job market analytics
 * All business logic delegated to marketInsightsService
 */

const marketInsightsService = require("../services/marketInsightsService");

/**
 * @desc    Get all IT fields with analytics
 * @route   GET /api/market/fields
 * @access  Public
 */
exports.getFields = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const demandLevel = req.query.demand || null;

    const result = await marketInsightsService.getAllFields({
      page,
      limit,
      demandLevel,
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching fields:", error);
    res.status(500).json({ error: "Failed to fetch fields" });
  }
};

/**
 * @desc    Get field overview with analytics
 * @route   GET /api/market/fields/:id
 * @access  Public
 */
exports.getFieldOverview = async (req, res) => {
  try {
    const fieldId = parseInt(req.params.id);

    if (!fieldId || isNaN(fieldId)) {
      return res.status(400).json({ error: "Valid field ID required" });
    }

    const result = await marketInsightsService.getFieldOverview(fieldId);

    if (!result) {
      return res.status(404).json({ error: "Field not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching field overview:", error);
    res.status(500).json({ error: "Failed to fetch field overview" });
  }
};

/**
 * @desc    Get top skills for a field
 * @route   GET /api/market/fields/:id/skills
 * @access  Public
 */
exports.getFieldSkills = async (req, res) => {
  try {
    const fieldId = parseInt(req.params.id);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    if (!fieldId || isNaN(fieldId)) {
      return res.status(400).json({ error: "Valid field ID required" });
    }

    const result = await marketInsightsService.getTopSkillsByField(fieldId, limit);
    res.json({ skills: result });
  } catch (error) {
    console.error("Error fetching field skills:", error);
    res.status(500).json({ error: "Failed to fetch field skills" });
  }
};

/**
 * @desc    Get salary distribution for a field
 * @route   GET /api/market/fields/:id/salary
 * @access  Public
 */
exports.getFieldSalary = async (req, res) => {
  try {
    const fieldId = parseInt(req.params.id);

    if (!fieldId || isNaN(fieldId)) {
      return res.status(400).json({ error: "Valid field ID required" });
    }

    const result = await marketInsightsService.getSalaryDistribution(fieldId);
    res.json(result);
  } catch (error) {
    console.error("Error fetching salary distribution:", error);
    res.status(500).json({ error: "Failed to fetch salary distribution" });
  }
};

/**
 * @desc    Get trending fields
 * @route   GET /api/market/trending
 * @access  Public
 */
exports.getTrendingFields = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const result = await marketInsightsService.getTrendingFields(limit);
    res.json({ trending: result });
  } catch (error) {
    console.error("Error fetching trending fields:", error);
    res.status(500).json({ error: "Failed to fetch trending fields" });
  }
};

/**
 * @desc    Search and filter jobs
 * @route   GET /api/market/jobs
 * @access  Public
 */
exports.searchJobs = async (req, res) => {
  try {
    const {
      field,
      level,
      salaryMin,
      salaryMax,
      skills,
      remote,
      search,
      page,
      limit,
    } = req.query;

    const filters = {
      fieldId: field ? parseInt(field) : null,
      experienceLevel: level || null,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
      skillIds: skills ? skills.split(",").map((id) => parseInt(id)) : [],
      isRemote: remote === "true" ? true : remote === "false" ? false : null,
      search: search || null,
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 20, 50),
    };

    const result = await marketInsightsService.searchJobs(filters);
    res.json(result);
  } catch (error) {
    console.error("Error searching jobs:", error);
    res.status(500).json({ error: "Failed to search jobs" });
  }
};

/**
 * @desc    Get all skills (for filters)
 * @route   GET /api/market/skills
 * @access  Public
 */
exports.getSkills = async (req, res) => {
  try {
    const category = req.query.category || null;
    const result = await marketInsightsService.getAllSkills(category);

    // Group by category for easier frontend consumption
    const grouped = result.reduce((acc, skill) => {
      const cat = skill.category || "other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});

    res.json({ skills: result, grouped });
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
};

/**
 * @desc    Get overall market statistics
 * @route   GET /api/market/stats
 * @access  Public
 */
exports.getMarketStats = async (req, res) => {
  try {
    const result = await marketInsightsService.getMarketStats();
    res.json(result);
  } catch (error) {
    console.error("Error fetching market stats:", error);
    res.status(500).json({ error: "Failed to fetch market statistics" });
  }
};

/**
 * @desc    Compare two fields
 * @route   GET /api/market/compare
 * @access  Public
 */
exports.compareFields = async (req, res) => {
  try {
    const fieldId1 = parseInt(req.query.field1);
    const fieldId2 = parseInt(req.query.field2);

    if (!fieldId1 || !fieldId2 || isNaN(fieldId1) || isNaN(fieldId2)) {
      return res.status(400).json({ error: "Two valid field IDs required (field1, field2)" });
    }

    if (fieldId1 === fieldId2) {
      return res.status(400).json({ error: "Cannot compare a field with itself" });
    }

    const result = await marketInsightsService.compareFields(fieldId1, fieldId2);

    if (!result) {
      return res.status(404).json({ error: "One or both fields not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error comparing fields:", error);
    res.status(500).json({ error: "Failed to compare fields" });
  }
};
