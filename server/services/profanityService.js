

const leoProfanity = require("leo-profanity");

leoProfanity.loadDictionary("en");

const customBannedWords = [

];

if (customBannedWords.length > 0) {
  leoProfanity.add(customBannedWords);
}

exports.containsProfanity = (text) => {
  if (!text || typeof text !== "string") return false;
  return leoProfanity.check(text);
};

exports.cleanText = (text) => {
  if (!text || typeof text !== "string") return text;
  return leoProfanity.clean(text);
};

exports.cleanFields = (obj, fields) => {
  const cleaned = { ...obj };
  fields.forEach((field) => {
    if (cleaned[field] && typeof cleaned[field] === "string") {
      cleaned[field] = leoProfanity.clean(cleaned[field]);
    }
  });
  return cleaned;
};

exports.getBadWords = (text) => {
  if (!text || typeof text !== "string") return [];

  const words = text.toLowerCase().split(/\s+/);
  return words.filter((word) => leoProfanity.check(word));
};

exports.addCustomWords = (words) => {
  if (Array.isArray(words) && words.length > 0) {
    leoProfanity.add(words);
  }
};

exports.removeWords = (words) => {
  if (Array.isArray(words) && words.length > 0) {
    leoProfanity.remove(words);
  }
};
