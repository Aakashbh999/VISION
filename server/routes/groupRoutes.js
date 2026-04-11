const express = require("express");
const router = express.Router();
const crudController = require("../controllers/groupCRUDController");
const mediaController = require("../controllers/groupMediaController");
const membershipController = require("../controllers/groupMembershipController");
const postController = require("../controllers/groupPostController");
const {
  verifyJWT,
  optionalJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");

// Get managed groups (owner/co-admin)
router.get("/managed", verifyJWT, crudController.getManagedGroups);

// List all groups
router.get("/", optionalJWT, crudController.getGroups);

// ── Post-level routes (specific before /:id) ──────────────────
router.get("/:id/posts", verifyJWT, postController.getPosts);
router.post(
  "/:id/posts",
  verifyJWT,
  requireApprovedStudent,
  sanitizeInput,
  postController.createPost,
);

// Soft delete post (user-initiated, records reason)
router.post(
  "/posts/:postId/soft-delete",
  verifyJWT,
  postController.softDeletePost,
);

// Members
router.get("/:id/members", verifyJWT, membershipController.getGroupMembers);

// Join / Leave / Request
router.post(
  "/:id/join",
  verifyJWT,
  requireApprovedStudent,
  sanitizeInput,
  membershipController.joinGroup,
);
router.delete(
  "/:id/leave",
  verifyJWT,
  requireApprovedStudent,
  membershipController.leaveGroup,
);
router.post(
  "/:id/request-join",
  verifyJWT,
  requireApprovedStudent,
  sanitizeInput,
  membershipController.requestToJoin,
);

// Join Requests management (admin/co-admin)
router.get(
  "/:id/join-requests",
  verifyJWT,
  membershipController.getJoinRequests,
);
router.post(
  "/:id/join-requests/:requestId/approve",
  verifyJWT,
  sanitizeInput,
  membershipController.approveRequest,
);
router.post(
  "/:id/join-requests/:requestId/decline",
  verifyJWT,
  sanitizeInput,
  membershipController.declineRequest,
);

// Co-Admin management (owner only)
router.post(
  "/:id/members/:memberId/appoint-co-admin",
  verifyJWT,
  sanitizeInput,
  membershipController.appointCoAdmin,
);
router.delete(
  "/:id/members/:memberId/co-admin",
  verifyJWT,
  sanitizeInput,
  membershipController.removeCoAdmin,
);
router.patch(
  "/:id/members/:memberId/permissions",
  verifyJWT,
  sanitizeInput,
  membershipController.updateCoAdminPermissions,
);

// Capacity expansion via VXP
router.post(
  "/:id/expand-capacity",
  verifyJWT,
  sanitizeInput,
  membershipController.expandCapacity,
);

// Image/Banner update
router.post(
  "/:id/image",
  verifyJWT,
  upload.single("image"),
  sanitizeInput,
  mediaController.updateGroupImage,
);
router.post(
  "/:id/banner",
  verifyJWT,
  upload.single("image"),
  sanitizeInput,
  mediaController.updateGroupBanner,
);

// Create group
router.post(
  "/",
  verifyJWT,
  requireApprovedStudent,
  sanitizeInput,
  crudController.createGroup,
);

// Update group (owner only)
router.patch("/:id", verifyJWT, sanitizeInput, crudController.updateGroup);

// Soft delete (user-initiated, records reason)
router.post(
  "/:id/soft-delete",
  verifyJWT,
  sanitizeInput,
  crudController.softDeleteGroup,
);

// Group details (generic — must be last)
router.get("/:id", optionalJWT, crudController.getGroupDetails);

module.exports = router;
