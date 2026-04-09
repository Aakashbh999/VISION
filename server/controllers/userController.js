const pool = require("../config/db");
const XPService = require("../services/xpService");
const { buildPresenceSelect } = require("../utils/presence");
const catchAsync = require("../utils/catchAsync");

exports.getMe = catchAsync(async (req, res) => {
    const { auth_user_id } = req.user;

    const result = await pool.query(
      `SELECT 
        a.auth_user_id,
        p.user_id as portal_user_id,
        a.email,
        a.email_status,
        a.role,
        p.full_name,
        p.semester,
        p.student_status,
        p.is_suspended,
        p.reputation_points,
        p.is_moderator,
        ${buildPresenceSelect("p")},
        p.academic_degree_id,
        pr.program_name
       FROM auth.users a
       LEFT JOIN portal.users p 
         ON a.auth_user_id = p.auth_user_id
       LEFT JOIN portal.programs pr 
         ON p.program_id = pr.program_id
       WHERE a.auth_user_id = $1`,
      [auth_user_id],
    );

    if (!result.rows.length) {
      throw new Error("User not found");
    }

    const userData = result.rows[0];

    // Fetch user badges (only select existing columns)
    const badgesRes = await pool.query(
      `SELECT badge_name, earned_at
       FROM portal.user_badges
       WHERE user_id = $1
       ORDER BY earned_at DESC`,
      [userData.portal_user_id],
    );

    res.json({
      ...userData,
      badges: badgesRes.rows,
    });
});

exports.updatePresence = catchAsync(async (req, res) => {
    const userId = req.user.portal_user_id;

    const result = await pool.query(
      `UPDATE portal.users
       SET last_seen_at = NOW()
       WHERE user_id = $1
       RETURNING last_seen_at`,
      [userId],
    );

    return res.json({
      last_seen_at: result.rows[0]?.last_seen_at || new Date(),
      is_online: true,
    });
});

exports.getUserStats = catchAsync(async (req, res) => {
    const userId = req.user.portal_user_id;
    const stats = await XPService.getUserStats(userId);

    if (!stats) {
      // Return default stats instead of 404 for a better UX
      return res.json({
        user_id: userId,
        total_xp: 0,
        current_level: 1,
        roadmaps_completed: 0,
        last_activity: new Date(),
      });
    }

    res.json(stats);
});
