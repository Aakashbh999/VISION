/**
 * Shared validation helpers used across controllers.
 * Centralized to follow DRY — previously duplicated in groupController + profileController.
 */
const { addDays, differenceInCalendarDays, isAfter } = require("date-fns");

/**
 * Count words in a text string.
 * @param {string} text
 * @returns {number}
 */
function countWords(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Check if a cooldown period is still active.
 * @param {string|Date|null} lastUpdate - Timestamp of last update
 * @param {number} days - Cooldown period in days
 * @returns {boolean}
 */
function isCooldownActive(lastUpdate, days) {
  if (!lastUpdate) return false;
  return isAfter(addDays(new Date(lastUpdate), days), new Date());
}

/**
 * Calculate remaining cooldown days.
 * @param {string|Date} lastUpdate - Timestamp of last update
 * @param {number} cooldownDays - Total cooldown period in days
 * @returns {number} Days remaining (0 if expired)
 */
function getCooldownDaysLeft(lastUpdate, cooldownDays) {
  if (!lastUpdate) return 0;
  const cooldownEnds = addDays(new Date(lastUpdate), cooldownDays);
  if (!isAfter(cooldownEnds, new Date())) return 0;
  return Math.max(differenceInCalendarDays(cooldownEnds, new Date()), 1);
}

/**
 * Validate description word count.
 * @param {*} description
 * @param {number} maxWords
 * @returns {{ valid: boolean, error?: string }}
 */
function validateDescription(description, maxWords) {
  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return { valid: false, error: "Description must be text" };
  }
  if (description && countWords(description) > maxWords) {
    return {
      valid: false,
      error: `Description must be ${maxWords} words or less`,
    };
  }
  return { valid: true };
}

module.exports = {
  countWords,
  isCooldownActive,
  getCooldownDaysLeft,
  validateDescription,
};
