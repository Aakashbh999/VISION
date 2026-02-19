const { Pool } = require("pg");
const path = require("path");

// Safely loads your .env from the root folder
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
