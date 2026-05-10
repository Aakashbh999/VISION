const pool = require("../config/db");
const recommendationService = require("../services/recommendationService");
const catchAsync = require("../utils/catchAsync");
const { buildPresenceSelect } = require("../utils/presence");

/**
 * Universal Search Endpoint (Roadmaps, Groups, Clubs, Resources, Users)
 * Supports weighting and fuzzy matching (ILIKE)dex search across Roadmaps, Groups, and Resources
 * Uses portal schema: roadmaps, study_groups (METADATA ONLY), resources with resource_scores
 * EXCLUDES: group_messages (chat messages) - messaging search is separate
 */

// Weight constants for scoring
const WEIGHTS = {
  EXACT_TITLE: 1.0, // Exact title/name match
  TAG_MATCH: 0.7, // Tag/specialty match
  DESCRIPTION: 0.3, // Description keyword match
};

/**
 * Calculate weighted score for a search match
 * @param {string} query - Search query
 * @param {Object} item - Item to score
 * @returns {number} - Weighted score
 */
const calculateScore = (query, { name, title, description, tags }) => {
  const normalizedQuery = query.toLowerCase().trim();
  const itemTitle = (name || title || "").toLowerCase();
  const itemDesc = (description || "").toLowerCase();
  const itemTags = Array.isArray(tags)
    ? tags.map((t) => (typeof t === "string" ? t : t.name || "").toLowerCase())
    : [];

  let score = 0;

  // Priority 1: Exact title/name match (weight 1.0)
  if (itemTitle === normalizedQuery) {
    score += WEIGHTS.EXACT_TITLE * 2; // Bonus for exact match
  } else if (itemTitle.includes(normalizedQuery)) {
    score += WEIGHTS.EXACT_TITLE;
  }

  // Priority 2: Tag/specialty match (weight 0.7)
  if (
    itemTags.some(
      (tag) => tag.includes(normalizedQuery) || normalizedQuery.includes(tag),
    )
  ) {
    score += WEIGHTS.TAG_MATCH;
  }

  // Priority 3: Description keyword match (weight 0.3)
  if (itemDesc.includes(normalizedQuery)) {
    score += WEIGHTS.DESCRIPTION;
  }

  return score;
};

/**
 * GET /api/search
 * Universal search endpoint with weighted results
 * Query params: q (search query), limit (max results per category)
 */
exports.universalSearch = catchAsync(async (req, res) => {
    const { q, limit = 5 } = req.query;
    const userId = req.user?.portal_user_id;
    const userSemester = req.user?.current_semester;
    const userProgramId = req.user?.program_id;
    const userDegreeId = req.user?.academic_degree_id;

    // Empty query - return recommendations
    if (!q || q.trim().length < 2) {
      const recommendations = await recommendationService.getRecommendations(
        userId,
        userSemester,
        userProgramId,
        userDegreeId,
        parseInt(limit),
      );
      return res.json({
        query: null,
        isRecommendation: true,
        ...recommendations,
        total:
          recommendations.roadmaps.length +
          recommendations.groups.length +
          recommendations.resources.length,
      });
    }

    const searchTerm = q.trim();
    const maxResults = Math.min(parseInt(limit) || 5, 10);

    // Parallel search across all indices (inline SQL — no external helpers needed)
    const [
      roadmapsResult,
      groupsResult,
      clubsResult,
      resourcesResult,
      discussionsResult,
      usersResult,
    ] = await Promise.all([
      // \u2500\u2500 ROADMAPS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      pool.query(
        `SELECT
            roadmap_id AS id,
            title,
            description,
            difficulty_level,
            'roadmap' AS type
          FROM portal.roadmaps
          WHERE is_active = TRUE
            AND (
              title % $1
              OR title ILIKE $2
            )
          ORDER BY similarity(title, $1) DESC, title
          LIMIT $3`,
        [searchTerm, `%${searchTerm}%`, maxResults],
      ),

      // \u2500\u2500 STUDY GROUPS (exclude private unless member) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      userId
        ? pool.query(
            `SELECT
                g.group_id AS id,
                g.name,
                g.description,
                g.group_image,
                g.is_public,
                g.privacy_type,
                COUNT(DISTINCT gm2.user_id) AS members,
                EXISTS(
                  SELECT 1 FROM portal.group_members gm3
                  WHERE gm3.group_id = g.group_id AND gm3.user_id = $4
                ) AS is_member
              FROM portal.study_groups g
              LEFT JOIN portal.group_members gm2 ON gm2.group_id = g.group_id
              WHERE g.deleted_at IS NULL AND (
                  g.privacy_type != 'private'
                  OR EXISTS(
                    SELECT 1 FROM portal.group_members
                    WHERE group_id = g.group_id AND user_id = $4
                  )
                )
                AND (
                  g.name % $1
                  OR g.name ILIKE $2
                )
              GROUP BY g.group_id, g.name, g.description, g.group_image, g.is_public, g.privacy_type
              ORDER BY similarity(g.name, $1) DESC, g.name
              LIMIT $3`,
            [searchTerm, `%${searchTerm}%`, maxResults, userId],
          )
        : pool.query(
            `SELECT
                g.group_id AS id,
                g.name,
                g.description,
                g.group_image,
                g.is_public,
                g.privacy_type,
                COUNT(DISTINCT gm2.user_id) AS members,
                FALSE AS is_member
              FROM portal.study_groups g
              LEFT JOIN portal.group_members gm2 ON gm2.group_id = g.group_id
              WHERE g.deleted_at IS NULL AND g.privacy_type != 'private'
                AND (
                  g.name % $1
                  OR g.name ILIKE $2
                )
              GROUP BY g.group_id, g.name, g.description, g.group_image, g.is_public, g.privacy_type
              ORDER BY similarity(g.name, $1) DESC, g.name
              LIMIT $3`,
            [searchTerm, `%${searchTerm}%`, maxResults],
          ),

      // \u2500\u2500 IT CLUBS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      pool.query(
        `SELECT
            c.id,
            c.slug,
            c.club_name,
            c.location,
            c.institution,
            c.specialty,
            c.description_full,
            c.logo_url,
            'club' AS type
          FROM portal.it_clubs c
          WHERE (
              c.club_name % $1
              OR c.club_name ILIKE $2
              OR COALESCE(c.specialty, '') ILIKE $2
              OR COALESCE(c.institution, '') ILIKE $2
            )
          ORDER BY similarity(c.club_name, $1) DESC, c.club_name
          LIMIT $3`,
        [searchTerm, `%${searchTerm}%`, maxResults],
      ),

      // \u2500\u2500 RESOURCES (approved only) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      pool.query(
        `SELECT
            r.resource_id AS id,
            r.title,
            r.description,
            r.semester,
            r.program_id,
            COALESCE(rs.avg_score, 0) AS avg_score,
            ARRAY(
              SELECT t.name FROM portal.resource_tags rt
              JOIN portal.tags t ON t.tag_id = rt.tag_id
              WHERE rt.resource_id = r.resource_id
            ) AS tags,
            'resource' AS type
          FROM portal.resources r
          LEFT JOIN (
            SELECT resource_id, AVG(score) AS avg_score
            FROM portal.resource_scores
            GROUP BY resource_id
          ) rs ON rs.resource_id = r.resource_id
          WHERE r.status = 'approved' AND r.deleted_at IS NULL
            AND (
              r.title % $1
              OR r.title ILIKE $2
              OR EXISTS (
                SELECT 1 FROM portal.resource_tags rt
                JOIN portal.tags t ON t.tag_id = rt.tag_id
                WHERE rt.resource_id = r.resource_id
                  AND (t.name % $1 OR t.name ILIKE $2)
              )
            )
          ORDER BY similarity(r.title, $1) DESC, COALESCE(rs.avg_score, 0) DESC, r.title
          LIMIT $3`,
        [searchTerm, `%${searchTerm}%`, maxResults],
      ),

      // \u2500\u2500 DISCUSSIONS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      pool.query(
        `SELECT
            d.discussion_id AS id,
            d.title,
            d.content AS description,
            u.full_name AS author,
            'discussion' AS type
          FROM portal.discussions d
          JOIN portal.users u ON u.user_id = d.user_id
          WHERE d.deleted_at IS NULL AND d.is_deleted = FALSE
          AND (
            d.title % $1
            OR d.title ILIKE $2
          )
          ORDER BY similarity(d.title, $1) DESC, d.created_at DESC
          LIMIT $3`,
        [searchTerm, `%${searchTerm}%`, maxResults],
      ),

      // \u2500\u2500 USERS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
      pool.query(
        `SELECT
            p.user_id AS id,
            p.full_name,
            p.university,
            p.campus,
            p.profile_image AS profile_picture,
            a.role,
            ${buildPresenceSelect("p")}
          FROM portal.users p
          JOIN auth.users a ON a.auth_user_id = p.auth_user_id
          WHERE p.is_suspended = FALSE
            AND a.email_status = 'verified'
            AND (p.student_status = 'approved' OR a.role = 'admin')
            AND ($4::int IS NULL OR p.user_id != $4)
            AND (
              p.full_name % $1
              OR p.full_name ILIKE $2
            )
          ORDER BY similarity(p.full_name, $1) DESC, p.full_name
          LIMIT $3`,
        [searchTerm, `%${searchTerm}%`, maxResults, userId || null],
      ),
    ]);

    // Score and format results
    const roadmaps = roadmapsResult.rows
      .map((r) => ({
        ...r,
        score: calculateScore(searchTerm, {
          title: r.title,
          description: r.description,
        }),
        path: `/roadmaps/${r.id}`,
      }))
      .sort((a, b) => b.score - a.score);

    const groups = groupsResult.rows
      .map((g) => ({
        ...g,
        score: calculateScore(searchTerm, {
          name: g.name,
          description: g.description,
        }),
        path: `/groups/${g.id}/profile`,
      }))
      .sort((a, b) => b.score - a.score);

    const resources = resourcesResult.rows
      .map((r) => ({
        ...r,
        score: calculateScore(searchTerm, {
          name: r.title,
          description: r.description,
          tags: r.tags,
        }),
        path: `/resources?id=${r.id}`,
      }))
      .sort((a, b) => b.score - a.score);

    const clubs = clubsResult.rows
      .map((c) => ({
        ...c,
        score: calculateScore(searchTerm, {
          name: c.club_name,
          description: [c.specialty, c.institution, c.description_full]
            .filter(Boolean)
            .join(" "),
          tags: c.specialty ? c.specialty.split(",").map((s) => s.trim()) : [],
        }),
        path: `/clubs/${c.slug || c.id}`,
      }))
      .sort((a, b) => b.score - a.score);

    const discussions = discussionsResult.rows
      .map((d) => ({
        ...d,
        score: calculateScore(searchTerm, {
          title: d.title,
          description: d.description,
        }),
        path: `/discussions/${d.id}`,
      }))
      .sort((a, b) => b.score - a.score);

    const users = usersResult.rows
      .map((u) => ({
        ...u,
        score: calculateScore(searchTerm, {
          name: u.full_name,
          description: [u.campus, u.university].filter(Boolean).join(" "),
        }),
        path: `/profile/${u.id}`,
      }))
      .sort((a, b) => b.score - a.score);

    const total =
      roadmaps.length +
      groups.length +
      clubs.length +
      resources.length +
      discussions.length +
      users.length;

    // Recommendation fallback if no results found
    if (total === 0) {
      const recommendations = await recommendationService.getRecommendations(
        userId,
        userSemester,
        userProgramId,
        userDegreeId,
        parseInt(limit),
      );
      return res.json({
        ...recommendations,
        noResults: true,
        originalQuery: searchTerm,
      });
    }

    res.json({
      query: searchTerm,
      roadmaps,
      groups,
      clubs,
      resources,
      discussions,
      users,
      total,
    });
});

/**
 * GET /api/search/suggestions
 * Quick search suggestions for autocomplete
 */
exports.getSearchSuggestions = catchAsync(async (req, res) => {
    const { q } = req.query;
    const userId = req.user?.portal_user_id;

    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const searchTerm = q.trim();

    // Build group privacy clause: exclude private groups unless the user is a member
    const groupPrivacyClause = userId
      ? `(privacy_type != 'private' OR EXISTS(
          SELECT 1 FROM portal.group_members
          WHERE group_id = study_groups.group_id AND user_id = ${userId}
        ))`
      : `privacy_type != 'private'`;

    // Get unique titles from all searchable entities with trigram fuzzy matching
    const suggestions = await pool.query(
      `SELECT DISTINCT suggestion, type FROM (
        SELECT title AS suggestion, 'roadmap' AS type
          FROM portal.roadmaps
          WHERE (title % $1 OR title ILIKE $2) AND is_active = TRUE
        UNION ALL
        SELECT name AS suggestion, 'group' AS type
          FROM portal.study_groups
          WHERE (name % $1 OR name ILIKE $2) AND deleted_at IS NULL
            AND ${groupPrivacyClause}
        UNION ALL
        SELECT club_name AS suggestion, 'club' AS type
          FROM portal.it_clubs
          WHERE club_name % $1 OR club_name ILIKE $2
            OR COALESCE(specialty, '') ILIKE $2
            OR COALESCE(institution, '') ILIKE $2
        UNION ALL
        SELECT title AS suggestion, 'resource' AS type
          FROM portal.resources
          WHERE (title % $1 OR title ILIKE $2) AND status = 'approved' AND deleted_at IS NULL
        UNION ALL
        SELECT title AS suggestion, 'discussion' AS type
          FROM portal.discussions
          WHERE (title % $1 OR title ILIKE $2) AND deleted_at IS NULL AND is_deleted = FALSE
        UNION ALL
        SELECT u.full_name AS suggestion, 'user' AS type
          FROM portal.users u
          JOIN auth.users a ON a.auth_user_id = u.auth_user_id
          WHERE (u.full_name % $1 OR u.full_name ILIKE $2)
            AND u.is_suspended = FALSE
            AND a.email_status = 'verified'
            AND (u.student_status = 'approved' OR a.role = 'admin')
            AND ($3::int IS NULL OR u.user_id != $3)
      ) combined
      ORDER BY similarity(suggestion, $1) DESC, suggestion
      LIMIT 8`,
      [searchTerm, `%${searchTerm}%`, userId || null],
    );

    res.json({ suggestions: suggestions.rows });
});
