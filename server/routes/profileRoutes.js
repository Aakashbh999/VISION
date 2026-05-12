const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/profileController");
const { verifyJWT, optionalJWT } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");

router.get("/me", verifyJWT, ctrl.getOwnProfile);
router.patch("/me", verifyJWT, sanitizeInput, ctrl.updateProfile);

router.patch("/bio", verifyJWT, sanitizeInput, ctrl.updateBio);

router.post(
  "/image",
  verifyJWT,
  upload.single("image"),
  sanitizeInput,
  ctrl.updateProfileImage,
);
router.delete("/image", verifyJWT, ctrl.removeProfileImage);

router.post(
  "/banner",
  verifyJWT,
  upload.single("image"),
  sanitizeInput,
  ctrl.updateProfileBanner,
);
router.delete("/banner", verifyJWT, ctrl.removeProfileBanner);

router.post("/:userId/follow", verifyJWT, ctrl.followUser);
router.delete("/:userId/follow", verifyJWT, ctrl.unfollowUser);

router.get("/:userId/followers", optionalJWT, ctrl.getFollowers);
router.get("/:userId/following", optionalJWT, ctrl.getFollowing);

router.get("/:userId", optionalJWT, ctrl.getPublicProfile);

module.exports = router;
