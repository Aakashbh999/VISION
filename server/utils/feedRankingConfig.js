const ACTION_KEYS = [
  "group_notice_posted",
  "resource_uploaded",
  "discussion_created",
  "group_join_approved",
  "group_joined",
  "completed_step",
  "boost",
  "user_followed",
  "default",
];

const DEFAULT_FEED_RANKING_CONFIG = {
  actionWeights: {
    group_notice_posted: 34,
    resource_uploaded: 28,
    discussion_created: 24,
    group_join_approved: 22,
    group_joined: 18,
    completed_step: 14,
    boost: 12,
    user_followed: 10,
    default: 8,
  },
  followWeight: 35,
  groupWeight: 20,
  degreeWeight: 12,
  programWeight: 10,
  recencyBase: 30,
  recencyHalfLifeHours: 36,
  recommendationDivisor: 10,
  recommendationCap: 15,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseNumeric = (input, fallback, min, max) => {
  if (input === undefined || input === null || input === "") return fallback;
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return fallback;
  return clamp(parsed, min, max);
};

const resolveFeedRankingConfig = (query = {}) => {
  const config = {
    ...DEFAULT_FEED_RANKING_CONFIG,
    actionWeights: { ...DEFAULT_FEED_RANKING_CONFIG.actionWeights },
  };

  config.followWeight = parseNumeric(
    query.wFollow,
    config.followWeight,
    0,
    100,
  );
  config.groupWeight = parseNumeric(query.wGroup, config.groupWeight, 0, 100);
  config.degreeWeight = parseNumeric(
    query.wDegree,
    config.degreeWeight,
    0,
    100,
  );
  config.programWeight = parseNumeric(
    query.wProgram,
    config.programWeight,
    0,
    100,
  );
  config.recencyBase = parseNumeric(query.wRecency, config.recencyBase, 0, 100);
  config.recencyHalfLifeHours = parseNumeric(
    query.wRecencyHalfLife,
    config.recencyHalfLifeHours,
    1,
    240,
  );
  config.recommendationDivisor = parseNumeric(
    query.wRecDivisor,
    config.recommendationDivisor,
    1,
    100,
  );
  config.recommendationCap = parseNumeric(
    query.wRecCap,
    config.recommendationCap,
    0,
    100,
  );

  ACTION_KEYS.forEach((key) => {
    const queryKey = `aw_${key}`;
    config.actionWeights[key] = parseNumeric(
      query[queryKey],
      config.actionWeights[key],
      0,
      100,
    );
  });

  return config;
};

module.exports = {
  DEFAULT_FEED_RANKING_CONFIG,
  ACTION_KEYS,
  resolveFeedRankingConfig,
};
