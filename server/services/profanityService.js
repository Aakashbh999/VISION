/**
 * Profanity Filtering Service
 * Uses leo-profanity for content moderation with auto-clean functionality
 */

const leoProfanity = require("leo-profanity");

// Initialize with English dictionary
leoProfanity.loadDictionary("en");

// Add custom banned words specific to your platform (optional)
const customBannedWords = [
  // Add custom words here if needed
];

if (customBannedWords.length > 0) {
  leoProfanity.add(customBannedWords);
}

/**
 * Check if text contains profanity
 * @param {string} text - Text to check
 * @returns {boolean} - True if profanity is detected
 */
exports.containsProfanity = (text) => {
  if (!text || typeof text !== "string") return false;
  return leoProfanity.check(text);
};

/**
 * Clean text by replacing profanity with asterisks
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
exports.cleanText = (text) => {
  if (!text || typeof text !== "string") return text;
  return leoProfanity.clean(text);
};

/**
 * Clean multiple fields in an object
 * @param {Object} obj - Object with fields to clean
 * @param {string[]} fields - Array of field names to clean
 * @returns {Object} - Object with cleaned fields
 */
exports.cleanFields = (obj, fields) => {
  const cleaned = { ...obj };
  fields.forEach((field) => {
    if (cleaned[field] && typeof cleaned[field] === "string") {
      cleaned[field] = leoProfanity.clean(cleaned[field]);
    }
  });
  return cleaned;
};

/**
 * Get list of bad words found in text
 * @param {string} text - Text to check
 * @returns {string[]} - Array of bad words found
 */
exports.getBadWords = (text) => {
  if (!text || typeof text !== "string") return [];

  // Split text into words and check each
  const words = text.toLowerCase().split(/\s+/);
  return words.filter((word) => leoProfanity.check(word));
};

/**
 * Add custom words to the filter
 * @param {string[]} words - Words to add to filter
 */
exports.addCustomWords = (words) => {
  if (Array.isArray(words) && words.length > 0) {
    leoProfanity.add(words);
  }
};

/**
 * Remove words from the filter (whitelist)
 * @param {string[]} words - Words to remove from filter
 */
exports.removeWords = (words) => {
  if (Array.isArray(words) && words.length > 0) {
    leoProfanity.remove(words);
  }
};
