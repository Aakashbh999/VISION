const { Pool } = require("pg");
const path = require("path");

// This ensures your .env is loaded correctly from the server folder
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // This is mandatory for Neon
  },
});

pool.on("connect", () => {
  console.log("🐘 Connected to Neon Cloud PostgreSQL!");
});

module.exports = pool;
