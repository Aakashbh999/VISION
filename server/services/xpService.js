const pool = require('../config/db');

/**
 * VisionXP Service
 * Handles user XP transactions and leveling logic.
 */
class XPService {
    /**
     * Level Calculation Formula
     * Level = floor(sqrt(total_xp / 100)) + 1
     */
    static calculateLevel(totalXP) {
        return Math.floor(Math.sqrt(totalXP / 100)) + 1;
    }

    /**
     * Update User XP
     * @param {number} userId 
     * @param {number} amount 
     * @param {string} reason 
     * @param {object} client - Optional DB client for transactions
     */
    static async updateUserXP(userId, amount, reason, client = null) {
        const db = client || pool;
        
        try {
            // 1. Get current stats
            const currentStats = await db.query(
                'SELECT total_xp FROM portal.user_stats WHERE user_id = $1',
                [userId]
            );

            if (currentStats.rows.length === 0) {
                // Initialize if missing
                await db.query(
                    'INSERT INTO portal.user_stats (user_id, total_xp, current_level) VALUES ($1, $2, 1)',
                    [userId, amount]
                );
                return { level: 1, xp: amount, leveledUp: false };
            }

            const oldXP = currentStats.rows[0].total_xp;
            const newXP = oldXP + amount;
            const oldLevel = this.calculateLevel(oldXP);
            const newLevel = this.calculateLevel(newXP);
            const leveledUp = newLevel > oldLevel;

            // 2. Update stats
            await db.query(
                `UPDATE portal.user_stats 
                 SET total_xp = $1, 
                     current_level = $2, 
                     last_activity = CURRENT_TIMESTAMP 
                 WHERE user_id = $3`,
                [newXP, newLevel, userId]
            );

            // Write to audit log
            try {
              await db.query(
                `INSERT INTO portal.xp_activity_log
                 (user_id, amount, reason, new_total, new_level, created_at)
                 VALUES ($1, $2, $3, $4, $5, NOW())`,
                [userId, amount, reason, newXP, newLevel]
              );
            } catch (logErr) {
              console.error('[XP] Failed to write activity log:', logErr.message);
            }

            return { level: newLevel, xp: newXP, leveledUp };
        } catch (error) {
            console.error('[XP Service Error]:', error);
            throw error;
        }
    }

    /**
     * Get User Stats (explicit columns only — no SELECT *)
     */
    static async getUserStats(userId) {
        const res = await pool.query(
            `SELECT user_id, total_xp, current_level, last_activity
             FROM portal.user_stats WHERE user_id = $1`,
            [userId]
        );
        return res.rows[0] || null;
    }
}

module.exports = XPService;
