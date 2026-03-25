const express = require("express");
const router = express.Router();
const { verifyJWT } = require("../middleware/authMiddleware");
const notificationsController = require("../controllers/notificationsController");

router.get("/", verifyJWT, notificationsController.getNotifications);
router.patch("/read/:id", verifyJWT, notificationsController.markRead);
router.delete("/clear", verifyJWT, notificationsController.clearAll);
router.delete("/:id", verifyJWT, notificationsController.deleteNotification);

module.exports = router;
