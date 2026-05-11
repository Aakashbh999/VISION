

const marketInsightsService = require("../services/marketInsightsService");
const catchAsync = require("../utils/catchAsync");
const createError = require("http-errors");

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

exports.getFieldSalary = catchAsync(async (req, res) => {
  const fieldId = parseInt(req.params.id);

  if (!fieldId || isNaN(fieldId)) {
    throw createError(400, "Valid field ID required");
  }

  const result = await marketInsightsService.getSalaryDistribution(fieldId);
  res.json(result);
});

exports.getTrendingFields = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 20);
  const result = await marketInsightsService.getTrendingFields(limit);
  res.json({ trending: result });
});

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

exports.getSkills = catchAsync(async (req, res) => {
  const category = req.query.category || null;
  const result = await marketInsightsService.getAllSkills(category);

  const grouped = result.reduce((acc, skill) => {
    const cat = skill.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  res.json({ skills: result, grouped });
});

exports.getMarketStats = catchAsync(async (req, res) => {
  const result = await marketInsightsService.getMarketStats();
  res.json(result);
});

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
