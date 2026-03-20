/**
 * Moderator Middleware
 * Allows access if the authenticated user is an admin OR has the is_moderator flag.
 * Must be used AFTER verifyJWT.
 */
exports.verifyModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const isAdmin = req.user.role === "admin";
  const isModerator = req.user.is_moderator === true;

  if (!isAdmin && !isModerator) {
    return res
      .status(403)
      .json({ error: "Moderator or admin access required" });
  }

  next();
};
