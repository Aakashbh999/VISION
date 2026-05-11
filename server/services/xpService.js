const pool = require("../config/db");

class XPService {
  static calculateLevel(totalXP) {
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }

  static async computeStreak(userId, db) {
    const res = await db.query(
      `SELECT DISTINCT DATE(created_at) AS activity_date
       FROM portal.xp_activity_log
       WHERE user_id = $1
         AND reason != '7_day_streak_bonus'
         AND created_at >= NOW() - INTERVAL '60 days'
       ORDER BY activity_date DESC`,
      [userId],
    );

    const dates = res.rows.map((r) => new Date(r.activity_date));
    if (!dates.length) return 0;

    let streak = 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today);
      expected.setUTCDate(today.getUTCDate() - i);
      const actual = new Date(dates[i]);
      actual.setUTCHours(0, 0, 0, 0);

      if (actual.getTime() === expected.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  static async checkAndAwardStreakBonus(userId, streak, db) {
    if (streak < 7) return;

    const alreadyAwarded = await db.query(
      `SELECT 1 FROM portal.xp_activity_log
       WHERE user_id = $1
         AND reason = '7_day_streak_bonus'
         AND DATE(created_at) = CURRENT_DATE
       LIMIT 1`,
      [userId],
    );

    if (alreadyAwarded.rows.length > 0) return;

    const currentStats = await db.query(
      "SELECT total_xp FROM portal.user_stats WHERE user_id = $1",
      [userId],
    );
    if (!currentStats.rows.length) return;

    const oldXP = currentStats.rows[0].total_xp;
    const newXP = oldXP + 10;
    const newLevel = this.calculateLevel(newXP);

    await db.query(
      `UPDATE portal.user_stats
       SET total_xp = $1, current_level = $2, last_activity = CURRENT_TIMESTAMP
       WHERE user_id = $3`,
      [newXP, newLevel, userId],
    );

    await db.query(
      `INSERT INTO portal.xp_activity_log
         (user_id, amount, reason, new_total, new_level, created_at)
       VALUES ($1, 10, '7_day_streak_bonus', $2, $3, NOW())`,
      [userId, newXP, newLevel],
    );
  }

  static async updateUserXP(userId, amount, reason, client = null) {
    const db = client || pool;

    try {
      const currentStats = await db.query(
        "SELECT total_xp FROM portal.user_stats WHERE user_id = $1",
        [userId],
      );

      if (currentStats.rows.length === 0) {
        const initialXP = Math.max(0, amount);
        await db.query(
          "INSERT INTO portal.user_stats (user_id, total_xp, current_level, current_streak) VALUES ($1, $2, 1, 0)",
          [userId, initialXP],
        );

        try {
          await db.query(
            `INSERT INTO portal.xp_activity_log
               (user_id, amount, reason, new_total, new_level, created_at)
             VALUES ($1, $2, $3, $4, 1, NOW())`,
            [userId, initialXP, reason, initialXP],
          );
        } catch (logErr) {
          // Log write failed, but continue
        }
        return { level: 1, xp: initialXP, leveledUp: false, streak: 0 };
      }

      const oldXP = currentStats.rows[0].total_xp;
      const newXP = Math.max(0, oldXP + amount);
      const oldLevel = this.calculateLevel(oldXP);
      const newLevel = this.calculateLevel(newXP);
      const leveledUp = newLevel > oldLevel;

      const streak = await this.computeStreak(userId, db);

      await db.query(
        `UPDATE portal.user_stats
         SET total_xp = $1,
             current_level = $2,
             current_streak = $3,
             last_activity = CURRENT_TIMESTAMP
         WHERE user_id = $4`,
        [newXP, newLevel, streak, userId],
      );

      try {
        await db.query(
          `INSERT INTO portal.xp_activity_log
             (user_id, amount, reason, new_total, new_level, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [userId, amount, reason, newXP, newLevel],
        );
      } catch (logErr) {
        // Log write failed, but continue
      }

      const updatedStreak = await this.computeStreak(userId, db);

      await db.query(
        `UPDATE portal.user_stats SET current_streak = $1 WHERE user_id = $2`,
        [updatedStreak, userId],
      );

      this.checkAndAwardStreakBonus(userId, updatedStreak, pool).catch(
        (err) => null, // Silently handle streak bonus errors
      );

      return { level: newLevel, xp: newXP, leveledUp, streak: updatedStreak };
    } catch (error) {
      console.error("[XP Service Error]:", error);
      throw error;
    }
  }

  static async getUserStats(userId) {
    const res = await pool.query(
      `SELECT user_id, total_xp, current_level, current_streak, last_activity
       FROM portal.user_stats WHERE user_id = $1`,
      [userId],
    );
    return res.rows[0] || null;
  }
}

module.exports = XPService;
