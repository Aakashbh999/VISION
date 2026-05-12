

const PROFILE_PIC_COOLDOWN_DAYS = 7;
const BANNER_COOLDOWN_DAYS = 14;

const VXP_BYPASS_COST = 200;
const VXP_EXPAND_COST = 100;

const MAX_CAPACITY = 25;
const MAX_CO_ADMINS = 4;

const MAX_DESCRIPTION_WORDS = 130;
const MAX_BIO_WORDS = 130;

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
