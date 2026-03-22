const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyJWT } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post(
  "/complete-registration",
  verifyJWT,
  upload.single("student_id_image"),
  authController.completeRegistration,
);

// Token refresh (no auth required, but needs valid refresh token)
router.post("/refresh-token", authController.refreshToken);

// Logout (works with or without auth)
router.post("/logout", authController.logout);

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
