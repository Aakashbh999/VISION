const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const itRoutes = require("./routes/itRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");

const programRoutes = require("./routes/programRoutes");

const pool = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 🚀 Database Verification & Health Check (New Verification Logic)
app.get("/api/health", async (req, res) => {
  try {
    // This query confirms the .env search_path is working and sees your tables
    const dbCheck = await pool.query(`
      SELECT 
        current_setting('search_path') as path,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'auth') as auth_tables,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'portal') as portal_tables
    `);

    res.json({
      status: "online",
      message: "VISION Server is synchronized with Neon Cloud",
      database: {
        searchPath: dbCheck.rows[0].path,
        authTablesFound: dbCheck.rows[0].auth_tables,
        portalTablesFound: dbCheck.rows[0].portal_tables,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: err.message,
    });
  }
});
// 🚀 Use the Modular Routes
// This means all routes in itRoutes will now start with /api
app.use("/api", itRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", programRoutes);
app.use("/api", userRoutes);
app.use("/api", adminRoutes);
app.use("/api/roadmaps", roadmapRoutes);

// 🔐 Protected Portal Route
const {
  verifyJWT,
  requireApprovedStudent,
} = require("./middleware/authMiddleware");

app.get(
  "/api/portal/dashboard",
  verifyJWT,
  requireApprovedStudent,
  (req, res) => {
    res.json({ message: "Welcome to VISION Portal 🚀" });
  },
);

// Root Test Route
app.get("/", (req, res) => {
  res.send(
    "🚀 VISION Server is structured, modular, and ready for the market!",
  );
});

// Start server locally
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`⭐ Server flowing on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
