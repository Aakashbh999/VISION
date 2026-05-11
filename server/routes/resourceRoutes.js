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

router.get("/resources", optionalJWT, resourceCtrl.getResources);

router.get("/resources/my", verifyJWT, resourceCtrl.getMyResources);

router.post(
  "/resources",
  verifyJWT,
  requireApprovedStudent,
  upload.single("file"),
  sanitizeInput,
  resourceCtrl.uploadResource,
);

router.post(
  "/resources/:id/soft-delete",
  verifyJWT,
  sanitizeInput,
  resourceCtrl.softDeleteResource,
);

module.exports = router;
