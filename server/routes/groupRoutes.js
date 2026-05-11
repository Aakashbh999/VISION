const express = require("express");
const router = express.Router();
const crudController = require("../controllers/groupCRUDController");
const mediaController = require("../controllers/groupMediaController");
const membershipController = require("../controllers/groupMembershipController");
const postController = require("../controllers/groupPostController");
const groupPostUpload = require("../middleware/groupPostUpload");
const {
  verifyJWT,
  optionalJWT,
  requireApprovedStudent,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");

router.get("/managed", verifyJWT, crudController.getManagedGroups);

router.get("/", optionalJWT, crudController.getGroups);

router.get("/:id/posts", verifyJWT, postController.getPosts);
router.post(
  "/:id/posts",
  verifyJWT,
  requireApprovedStudent,
  groupPostUpload.single("file"),
  sanitizeInput,
  postController.createPost,
);

router.post(
  "/posts/:postId/soft-delete",
  verifyJWT,
  postController.softDeletePost,
);

router.patch(
  "/posts/:postId/answer",
  verifyJWT,
  sanitizeInput,
  postController.updateQaAnswer,
);

router.get("/:id/members", verifyJWT, membershipController.getGroupMembers);

router.post(
  "/:id/invitations",
  verifyJWT,
  requireApprovedStudent,
  sanitizeInput,
  membershipController.inviteMember,
);
router.post(
  "/invitations/:invitationId/accept",
  verifyJWT,
  membershipController.acceptInvitation,
);
router.post(
  "/invitations/:invitationId/reject",
  verifyJWT,
  membershipController.rejectInvitation,
);
router.delete(
  "/:id/members/:memberId",
  verifyJWT,
  membershipController.removeMember,
);

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

router.post(
  "/:id/expand-capacity",
  verifyJWT,
  sanitizeInput,
  membershipController.expandCapacity,
);

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

router.post(
  "/",
  verifyJWT,
  requireApprovedStudent,
  sanitizeInput,
  crudController.createGroup,
);

router.patch("/:id", verifyJWT, sanitizeInput, crudController.updateGroup);

router.post(
  "/:id/soft-delete",
  verifyJWT,
  sanitizeInput,
  crudController.softDeleteGroup,
);

router.get("/:id", optionalJWT, crudController.getGroupDetails);

module.exports = router;
