const XPService = require("../services/xpService");

/**
 * Controller to expose XP utility for other controllers to import
 * as per the integration rules.
 */
exports.updateUserXP = async (userId, amount, reason, client = null) => {
    return await XPService.updateUserXP(userId, amount, reason, client);
};

exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.portal_user_id;
        const stats = await XPService.getUserStats(userId);
        
        if (!stats) {
            return res.status(404).json({ error: "Stats not found" });
        }

        res.json(stats);
    } catch (err) {
        console.error("Error in getUserStats:", err);
        res.status(500).json({ error: "Failed to fetch user stats" });
    }
};
