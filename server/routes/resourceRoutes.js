const express = require("express");
const router = express.Router();

const resourceCtrl = require("../controllers/resourceController");
const upload = require("../middleware/uploadMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");
const {
  verifyJWT,
  optionalJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");

// ── Public ────────────────────────────────────────────────
// GET /api/resources – approved resources only, with filters
router.get("/resources", optionalJWT, resourceCtrl.getResources);

// ── Authenticated ─────────────────────────────────────────
// GET /api/resources/my – user's own uploads (all statuses)
router.get("/resources/my", verifyJWT, resourceCtrl.getMyResources);

// POST /api/resources – upload a new resource (pending)
// Uses multer middleware for file uploads to Cloudinary
router.post(
  "/resources",
  verifyJWT,
  requireApprovedStudent,
  upload.single("file"),
  sanitizeInput,
  resourceCtrl.uploadResource,
);

// Soft delete resource (user-initiated, records reason)
router.post(
  "/resources/:id/soft-delete",
  verifyJWT,
  sanitizeInput,
  resourceCtrl.softDeleteResource,
);

module.exports = router;
