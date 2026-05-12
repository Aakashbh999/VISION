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

router.post(
  "/refresh-token",
  validateBody(refreshTokenSchema),
  authController.refreshToken,
);

router.post("/logout", validateBody(logoutSchema), authController.logout);

router.post(
  "/resend-verification",
  verifyJWT,
  authController.resendVerificationEmail,
);
router.post("/logout-all", verifyJWT, authController.logoutAllDevices);
router.get("/sessions", verifyJWT, authController.getSessions);
router.delete("/sessions/:id", verifyJWT, authController.revokeSessionById);

module.exports = router;
