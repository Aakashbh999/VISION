const express = require("express");
const compression = require("compression");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const env = require("./config/env");
const logger = require("./utils/logger");
const sanitizeInput = require("./middleware/sanitizeInput");
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
const campusRoutes = require("./routes/campusRoutes");
const { checkEmailHealth } = require("./utils/emailService");

const pool = require("./config/db");

const app = express();
const PORT = env.PORT;

app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://vision-two-beta.vercel.app",
    ];

app.use(
  cors({
    origin: (origin, callback) => {

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
app.use(compression());
app.use(sanitizeInput);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many password reset attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", passwordResetLimiter);
app.use("/api/auth/reset-password", passwordResetLimiter);

app.get("/api/health", async (req, res) => {
  try {

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

app.get("/api/health/email", (req, res) => {
  const emailHealth = checkEmailHealth();

  if (!emailHealth.ok) {
    return res.status(503).json({
      status: "degraded",
      email: emailHealth,
      message: "Email service is not fully configured",
    });
  }

  return res.json({
    status: "online",
    email: emailHealth,
    message: "Email service configuration is healthy",
  });
});

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
app.use("/api/campuses", campusRoutes);

app.get("/", (req, res) => {
  res.send("VISION Server is structured, modular, and ready for the market!");
});

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT }, "VISION Server running");
});
