const express = require("express");
const cors = require("cors");
const pool = require("./db/pool"); // Ensure this path correctly points to your pool.js
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running and ready for VISION!");
});

// 2. IT Fields Route (Matches it_fields.csv)
app.get("/api/it-fields", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM it_fields ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Failed to fetch IT fields" });
  }
});

// 3. Academic Degrees Route (Matches academic_degrees.csv)
app.get("/api/academic-degrees", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM academic_degrees ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Failed to fetch academic degrees" });
  }
});

// 4. Job Market Route (Matches job_market_insights.csv)
app.get("/api/job-market", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM job_market_insights ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Failed to fetch job market data" });
  }
});

// 5. IT Clubs Route (Matches it_clubs.csv)
app.get("/api/it-clubs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM it_clubs ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Failed to fetch IT clubs" });
  }
});

// IMPORTANT: This allows the server to run locally
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`⭐ Server flowing on http://localhost:${PORT}`);
  });
}

// IMPORTANT: This allows Vercel to use the app
module.exports = app;
