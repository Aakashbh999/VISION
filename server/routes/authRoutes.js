const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyJWT } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validateBody = require("../middleware/validateBody");
const sanitizeInput = require("../middleware/sanitizeInput");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  logoutSchema,
} = require("../validation/registerSchema");

// Public routes
router.post(
  "/register",
  upload.single("academic_certificate"),
  sanitizeInput,
  validateBody(registerSchema),
  authController.register,
);
router.post(
  "/login",
  sanitizeInput,
  validateBody(loginSchema),
  authController.login,
);
router.get("/verify-email", authController.verifyEmail);
router.post(
  "/forgot-password",
  sanitizeInput,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  sanitizeInput,
  validateBody(resetPasswordSchema),
  authController.resetPassword,
);

// Token refresh (no auth required, but needs valid refresh token)
router.post(
  "/refresh-token",
  validateBody(refreshTokenSchema),
  authController.refreshToken,
);

// Logout (works with or without auth)
router.post("/logout", validateBody(logoutSchema), authController.logout);

// Protected routes (require valid access token)
router.post(
  "/resend-verification",
  verifyJWT,
  authController.resendVerificationEmail,
);
router.post("/logout-all", verifyJWT, authController.logoutAllDevices);
router.get("/sessions", verifyJWT, authController.getSessions);
router.delete("/sessions/:id", verifyJWT, authController.revokeSessionById);

module.exports = router;
