const xss = require("xss");

const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return xss(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const result = {};
    Object.entries(value).forEach(([key, nestedValue]) => {
      result[key] = sanitizeValue(nestedValue);
    });
    return result;
  }

  return value;
};

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  next();
};

module.exports = sanitizeInput;
