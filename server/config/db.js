const { Pool } = require("pg");
const env = require("./env");
const logger = require("../utils/logger");

// Sanitize DATABASE_URL if it contains CLI prefix or surrounding quotes
let connectionString = env.DATABASE_URL || "";
if (typeof connectionString === "string") {
  connectionString = connectionString.trim();
  // remove leading 'psql ' if someone pasted the CLI command
  if (connectionString.toLowerCase().startsWith("psql ")) {
    connectionString = connectionString.replace(/^psql\s+/i, "");
  }
  // remove surrounding single or double quotes
  connectionString = connectionString.replace(/^['"]|['"]$/g, "");
}

const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: { rejectUnauthorized: false },
});

// This is the "Magic Fix" for Neon's pooler
pool.on("connect", (client) => {
  client
    .query("SET search_path TO auth, portal, public")
    .then(() => {
      logger.info("DB connected: search path set to [auth, portal, public]");
    })
    .catch((err) => logger.error({ err }, "Error setting DB search path"));
});

module.exports = pool;
