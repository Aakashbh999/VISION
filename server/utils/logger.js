const pino = require("pino");
const env = require("../config/env");

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
});

module.exports = logger;
