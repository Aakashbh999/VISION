/**
 * Shared constants used across multiple controllers.
 * Centralized to follow DRY — previously duplicated in groupController + profileController.
 */

// Image cooldown periods
const PROFILE_PIC_COOLDOWN_DAYS = 7;
const BANNER_COOLDOWN_DAYS = 14;

// VXP costs
const VXP_BYPASS_COST = 200;       // VXP to skip cooldown
const VXP_EXPAND_COST = 100;       // VXP per +2 capacity slots

// Group limits
const MAX_CAPACITY = 25;
const MAX_CO_ADMINS = 4;

// Content limits
const MAX_DESCRIPTION_WORDS = 130;
const MAX_BIO_WORDS = 130;

// Group default permissions
const EMPTY_GROUP_PERMISSIONS = {
  manage_users: false,
  moderate_content: false,
  edit_profile: false,
  post_notice: false,
};

const DEFAULT_CO_ADMIN_PERMISSIONS = {
  manage_users: true,
  moderate_content: true,
  edit_profile: true,
  post_notice: true,
};

module.exports = {
  PROFILE_PIC_COOLDOWN_DAYS,
  BANNER_COOLDOWN_DAYS,
  VXP_BYPASS_COST,
  VXP_EXPAND_COST,
  MAX_CAPACITY,
  MAX_CO_ADMINS,
  MAX_DESCRIPTION_WORDS,
  MAX_BIO_WORDS,
  EMPTY_GROUP_PERMISSIONS,
  DEFAULT_CO_ADMIN_PERMISSIONS,
};
