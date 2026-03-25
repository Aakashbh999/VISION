const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const itRoutes = require("./routes/itRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const resourceInteractionRoutes = require("./routes/resourceInteractionRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const feedRoutes = require("./routes/feedRoutes");
const programRoutes = require("./routes/programRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const groupRoutes = require("./routes/groupRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const marketInsightsRoutes = require("./routes/marketInsightsRoutes");
const searchRoutes = require("./routes/searchRoutes");
const profileRoutes = require("./routes/profileRoutes");
const clubRoutes = require("./routes/clubRoutes");
const studyGroupRoutes = require("./routes/studyGroupRoutes");

const pool = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers

// CORS: restrict to whitelisted origins in production
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173", 
      "http://localhost:5174",
      "https://vision-two-beta.vercel.app"
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      // Allow any Vercel deployment (preview or production domains)
      if (
        !origin || 
        allowedOrigins.includes(origin) || 
        (origin && origin.endsWith(".vercel.app"))
      ) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json());

// Rate limiting for auth routes (prevents brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP per window
  message: { error: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for password reset (prevents email enumeration)
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  message: { error: "Too many password reset attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to auth endpoints
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", passwordResetLimiter);
app.use("/api/auth/reset-password", passwordResetLimiter);

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
app.use("/api", resourceInteractionRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/portal/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api", resourceRoutes);
app.use("/api/market", marketInsightsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/study-groups", studyGroupRoutes);

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

// Start server (Render will set PORT automatically)
app.listen(PORT, () => {
  console.log(`🚀 VISION Server running on port ${PORT}`);
});
