const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/profileController");
const { verifyJWT, optionalJWT } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const sanitizeInput = require("../middleware/sanitizeInput");

// Own profile (private fields)
router.get("/me", verifyJWT, ctrl.getOwnProfile);
router.patch("/me", verifyJWT, sanitizeInput, ctrl.updateProfile);

// Update bio
router.patch("/bio", verifyJWT, sanitizeInput, ctrl.updateBio);

// Update profile picture (image upload with cooldown logic)
router.post(
  "/image",
  verifyJWT,
  upload.single("image"),
  sanitizeInput,
  ctrl.updateProfileImage,
);
router.delete("/image", verifyJWT, ctrl.removeProfileImage);

// Update banner (image upload with cooldown logic)
router.post(
  "/banner",
  verifyJWT,
  upload.single("image"),
  sanitizeInput,
  ctrl.updateProfileBanner,
);
router.delete("/banner", verifyJWT, ctrl.removeProfileBanner);

// Follow / Unfollow
router.post("/:userId/follow", verifyJWT, ctrl.followUser);
router.delete("/:userId/follow", verifyJWT, ctrl.unfollowUser);

// Followers / Following lists
router.get("/:userId/followers", optionalJWT, ctrl.getFollowers);
router.get("/:userId/following", optionalJWT, ctrl.getFollowing);

// Public profile — must be LAST (catches :userId)
router.get("/:userId", optionalJWT, ctrl.getPublicProfile);

module.exports = router;
