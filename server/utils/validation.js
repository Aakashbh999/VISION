
const { addDays, differenceInCalendarDays, isAfter } = require("date-fns");

function countWords(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isCooldownActive(lastUpdate, days) {
  if (!lastUpdate) return false;
  return isAfter(addDays(new Date(lastUpdate), days), new Date());
}

function getCooldownDaysLeft(lastUpdate, cooldownDays) {
  if (!lastUpdate) return 0;
  const cooldownEnds = addDays(new Date(lastUpdate), cooldownDays);
  if (!isAfter(cooldownEnds, new Date())) return 0;
  return Math.max(differenceInCalendarDays(cooldownEnds, new Date()), 1);
}

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
