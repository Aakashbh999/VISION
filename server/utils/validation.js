/**
 * Shared validation helpers used across controllers.
 * Centralized to follow DRY — previously duplicated in groupController + profileController.
 */

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
  return Date.now() - new Date(lastUpdate).getTime() < days * 86400000;
}

/**
 * Calculate remaining cooldown days.
 * @param {string|Date} lastUpdate - Timestamp of last update
 * @param {number} cooldownDays - Total cooldown period in days
 * @returns {number} Days remaining (0 if expired)
 */
function getCooldownDaysLeft(lastUpdate, cooldownDays) {
  if (!lastUpdate) return 0;
  const elapsed = Date.now() - new Date(lastUpdate).getTime();
  const remaining = cooldownDays * 86400000 - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 86400000) : 0;
}

/**
 * Validate description word count.
 * @param {*} description
 * @param {number} maxWords
 * @returns {{ valid: boolean, error?: string }}
 */
function validateDescription(description, maxWords) {
  if (description !== undefined && description !== null && typeof description !== "string") {
    return { valid: false, error: "Description must be text" };
  }
  if (description && countWords(description) > maxWords) {
    return { valid: false, error: `Description must be ${maxWords} words or less` };
  }
  return { valid: true };
}

module.exports = {
  countWords,
  isCooldownActive,
  getCooldownDaysLeft,
  validateDescription,
};
