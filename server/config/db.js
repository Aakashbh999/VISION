const { Pool } = require("pg");
const path = require("path");

// Safely loads your .env from the root folder
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Sanitize DATABASE_URL if it contains CLI prefix or surrounding quotes
let connectionString = process.env.DATABASE_URL || "";
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
      console.log(
        "🐘 Neon Connected: Search path set to [auth, portal, public]",
      );
    })
    .catch((err) => console.error("❌ Error setting search path:", err));
});

module.exports = pool;
