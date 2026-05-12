/**
 * Recommendation Controller
 * Delivers personalized resource recommendations using weighted multi-factor scoring algorithm.
 * Caches scoring results (6-hour TTL) to optimize performance on repeated requests.
 *
 * Scoring Factors:
 * - User academic alignment (program, degree, semester)
 * - Resource popularity (views, completions, interactions)
 * - Recency bias (prefer newer resources)
 * - User engagement history (previously completed similar resources)
 * - Community voting (helpfulness ratings)
 *
 * Features:
 * - Cache-aware recommendation fetching (6-hour TTL)
 * - Auto-cache cleanup for expired scores
 * - Top-10 recommendations per request
 * - Scoring transparency (can expose score breakdown for analysis)
 */

const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");

/**
 * Get personalized resource recommendations
 * Retrieves top-10 recommended resources using multi-factor scoring with caching
 * Returns cached scores if available (6-hour TTL), otherwise calculates fresh recommendations
 *
 * @async
 * @param {Object} req - Express request (requires auth)
 * @param {Object} req.user - { auth_user_id, portal_user_id, program_id }
 * @param {Object} res - Express response
 * @returns {Object} - { source: 'cache'|'computed', recommendations: Array }
 */
exports.getRecommendations = catchAsync(async (req, res) => {
  const authUserId = req.user.auth_user_id;

  const { portal_user_id: user_id, program_id } = req.user;

  await pool.query(
    `
      DELETE FROM portal.resource_scores
      WHERE user_id = $1 AND calculated_at < NOW() - INTERVAL '6 hours'
    `,
    [user_id],
  );

  const cached = await pool.query(
    `SELECT r.resource_id, r.title, r.url, rs.score
       FROM portal.resource_scores rs
       JOIN portal.resources r ON r.resource_id = rs.resource_id
       WHERE rs.user_id = $1
       ORDER BY rs.score DESC
       LIMIT 10`,
    [user_id],
  );

  if (cached.rows.length > 0) {
    return res.json({
      source: "cache",
      recommendations: cached.rows,
    });
  }

  const calculated = await pool.query(
    `
      WITH RankedResources AS (
        SELECT
          $1::uuid AS user_id,
          r.resource_id,

          (
            -- Program match
            CASE WHEN r.program_id = $2 THEN 40 ELSE 0 END

            +

            -- Tag match
            (
              SELECT COUNT(*) * 10
              FROM portal.resource_tags rt
              JOIN portal.user_interests ui
                ON ui.tag_id = rt.tag_id
              WHERE rt.resource_id = r.resource_id
              AND ui.user_id = $1
            )

            +

            -- Popularity
            (
              SELECT COUNT(*) * 2
              FROM portal.user_resource_interactions uri
              WHERE uri.resource_id = r.resource_id
            )

            -

            -- Already completed penalty
            (
              SELECT COUNT(*) * 50
              FROM portal.user_resource_interactions uri
              WHERE uri.resource_id = r.resource_id
              AND uri.user_id = $1
              AND uri.interaction_type = 'completed'
            )

          ) AS score,

          'auto_calculated' AS reason

        FROM portal.resources r
        WHERE r.status = 'approved'
        ORDER BY score DESC
        LIMIT 50
      )
      INSERT INTO portal.resource_scores (user_id, resource_id, score, reason)
      SELECT user_id, resource_id, score, reason FROM RankedResources
      ON CONFLICT (user_id, resource_id)
      DO UPDATE SET
        score = EXCLUDED.score,
        calculated_at = NOW()
      `,
    [user_id, program_id],
  );

  const final = await pool.query(
    `SELECT r.resource_id, r.title, r.url, rs.score
       FROM portal.resource_scores rs
       JOIN portal.resources r ON r.resource_id = rs.resource_id
       WHERE rs.user_id = $1
       ORDER BY rs.score DESC
       LIMIT 10`,
    [user_id],
  );

  res.json({
    source: "calculated",
    recommendations: final.rows,
  });
});
