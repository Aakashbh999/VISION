/**
 * Market Insights Controller
 * Handles HTTP requests for job market analytics
 * All business logic delegated to marketInsightsService
 */

const marketInsightsService = require("../services/marketInsightsService");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

/**
 * @desc    Get all IT fields with analytics
 * @route   GET /api/market/fields
 * @access  Public
 */
exports.getFields = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const demandLevel = req.query.demand || null;

  const result = await marketInsightsService.getAllFields({
    page,
    limit,
    demandLevel,
  });

  res.json(result);
});

/**
 * @desc    Get field overview with analytics
 * @route   GET /api/market/fields/:id
 * @access  Public
 */
exports.getFieldOverview = catchAsync(async (req, res) => {
  const fieldId = parseInt(req.params.id);

  if (!fieldId || isNaN(fieldId)) {
    throw createError(400, "Valid field ID required");
  }

  const result = await marketInsightsService.getFieldOverview(fieldId);

  if (!result) {
    throw createError(404, "Field not found");
  }

  res.json(result);
});

/**
 * @desc    Get top skills for a field
 * @route   GET /api/market/fields/:id/skills
 * @access  Public
 */
exports.getFieldSkills = catchAsync(async (req, res) => {
  const fieldId = parseInt(req.params.id);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  if (!fieldId || isNaN(fieldId)) {
    throw createError(400, "Valid field ID required");
  }

  const result = await marketInsightsService.getTopSkillsByField(
    fieldId,
    limit,
  );
  res.json({ skills: result });
});

/**
 * @desc    Get salary distribution for a field
 * @route   GET /api/market/fields/:id/salary
 * @access  Public
 */
exports.getFieldSalary = catchAsync(async (req, res) => {
  const fieldId = parseInt(req.params.id);

  if (!fieldId || isNaN(fieldId)) {
    throw createError(400, "Valid field ID required");
  }

  const result = await marketInsightsService.getSalaryDistribution(fieldId);
  res.json(result);
});

/**
 * @desc    Get trending fields
 * @route   GET /api/market/trending
 * @access  Public
 */
exports.getTrendingFields = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 20);
  const result = await marketInsightsService.getTrendingFields(limit);
  res.json({ trending: result });
});

/**
 * @desc    Search and filter jobs
 * @route   GET /api/market/jobs
 * @access  Public
 */
exports.searchJobs = catchAsync(async (req, res) => {
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
});

/**
 * @desc    Get all skills (for filters)
 * @route   GET /api/market/skills
 * @access  Public
 */
exports.getSkills = catchAsync(async (req, res) => {
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
});

/**
 * @desc    Get overall market statistics
 * @route   GET /api/market/stats
 * @access  Public
 */
exports.getMarketStats = catchAsync(async (req, res) => {
  const result = await marketInsightsService.getMarketStats();
  res.json(result);
});

/**
 * @desc    Compare two fields
 * @route   GET /api/market/compare
 * @access  Public
 */
exports.compareFields = catchAsync(async (req, res) => {
  const fieldId1 = parseInt(req.query.field1);
  const fieldId2 = parseInt(req.query.field2);

  if (!fieldId1 || !fieldId2 || isNaN(fieldId1) || isNaN(fieldId2)) {
    throw createError(400, "Two valid field IDs required (field1, field2)");
  }

  if (fieldId1 === fieldId2) {
    throw createError(400, "Cannot compare a field with itself");
  }

  const result = await marketInsightsService.compareFields(fieldId1, fieldId2);

  if (!result) {
    throw createError(404, "One or both fields not found");
  }

  res.json(result);
});
