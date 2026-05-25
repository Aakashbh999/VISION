const { Pool } = require("pg");
const env = require("./env");
const logger = require("../utils/logger");

let connectionString = env.DATABASE_URL || "";
if (typeof connectionString === "string") {
  connectionString = connectionString.trim();

  if (connectionString.toLowerCase().startsWith("psql ")) {
    connectionString = connectionString.replace(/^psql\s+/i, "");
  }

  connectionString = connectionString.replace(/^['"]|['"]$/g, "");
}

const pool = new Pool({
  connectionString: connectionString || undefined,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on("connect", (client) => {
  client
    .query("SET search_path TO auth, portal, public")
    .then(() => {
      logger.info("DB connected: search path set to [auth, portal, public]");
    })
    .catch((err) => logger.error({ err }, "Error setting DB search path"));
});

pool.on("error", (err, client) => {
  logger.error({ err }, "Unexpected error on idle client");
});

module.exports = pool;
