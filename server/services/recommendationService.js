const pool = require("../config/db");

/**
 * Shared Recommendation Service
 */

const buildResourceQueryBase = () => `
SELECT 
  r.resource_id as id,
  r.title,
  r.description,
  r.semester,
  r.program_id,
  COALESCE(rs.avg_score, 0) as avg_score,
  COUNT(rs_all.score) as review_count,
  COALESCE(
    (SELECT array_agg(t.name) 
      FROM portal.resource_tags rt 
      JOIN portal.tags t ON t.tag_id = rt.tag_id 
      WHERE rt.resource_id = r.resource_id), 
    ARRAY[]::text[]
  ) as tags,
  'resource' as type
FROM portal.resources r
LEFT JOIN (
  SELECT resource_id, AVG(score)::numeric(4,2) as avg_score 
  FROM portal.resource_scores 
  GROUP BY resource_id
) rs ON rs.resource_id = r.resource_id
LEFT JOIN portal.resource_scores rs_all ON rs_all.resource_id = r.resource_id
`;

const buildGroupQueryBase = (userId, paramIndexForUser) => `
SELECT 
  g.group_id as id,
  g.name,
  g.description,
  g.group_image,
  g.is_public,
  g.degree_id,
  ad.full_name as degree_name,
  COUNT(DISTINCT gm.user_id) as member_count,
  ${userId ? `EXISTS(SELECT 1 FROM portal.group_members WHERE group_id = g.group_id AND user_id = $${paramIndexForUser}) AS is_member` : "FALSE AS is_member"},
  'group' as type
FROM portal.study_groups g
LEFT JOIN portal.group_members gm ON gm.group_id = g.group_id
LEFT JOIN portal.academic_degrees ad ON ad.id = g.degree_id
`;

exports.getRecommendations = async (
  userId,
  userSemester,
  userProgramId,
  userDegreeId,
  limit = 5,
) => {
  const recommendations = {
    roadmaps: [],
    groups: [],
    resources: [],
    discussions: [],
  };

  try {
    // 1. Resources
    if (userSemester || userProgramId) {
      let resourceQuery = `${buildResourceQueryBase()} WHERE r.status = 'approved'`;
      const params = [];
      if (userSemester) {
        params.push(userSemester);
        resourceQuery += ` AND r.semester = $${params.length}`;
      }
      if (userProgramId) {
        params.push(userProgramId);
        resourceQuery += ` AND (r.program_id = $${params.length} OR r.program_id IS NULL)`;
      }
      params.push(limit);
      resourceQuery += ` GROUP BY r.resource_id, r.title, r.description, r.semester, r.program_id, rs.avg_score ORDER BY COALESCE(rs.avg_score, 0) DESC LIMIT $${params.length}`;
      
      const res = await pool.query(resourceQuery, params);
      recommendations.resources = res.rows;
    }

    // 2. Groups
    const groupQuery = userId 
      ? `${buildGroupQueryBase(userId, 2)} WHERE g.degree_id = $1 GROUP BY g.group_id, g.name, g.description, g.group_image, g.is_public, g.degree_id, ad.full_name ORDER BY member_count DESC LIMIT $3`
      : `${buildGroupQueryBase(userId, 1)} GROUP BY g.group_id, g.name, g.description, g.group_image, g.is_public, g.degree_id, ad.full_name ORDER BY member_count DESC LIMIT $1`;
    
    const groupParams = userId ? [userDegreeId, userId, limit] : [limit];
    const groupRes = await pool.query(groupQuery, groupParams);
    recommendations.groups = groupRes.rows;

    // 3. Roadmaps
    const roadmapRes = await pool.query(`SELECT roadmap_id as id, title, description, 'roadmap' as type FROM portal.roadmaps WHERE is_active = TRUE LIMIT $1`, [limit]);
    recommendations.roadmaps = roadmapRes.rows;

    // 4. Discussions (Trending/Popular)
    const discussionRes = await pool.query(`
      SELECT d.discussion_id, d.title, d.like_count, d.comment_count, u.full_name as author
      FROM portal.discussions d
      JOIN portal.users u ON u.user_id = d.user_id
      WHERE d.deleted_at IS NULL
      ORDER BY (d.like_count * 2 + d.comment_count) DESC
      LIMIT $1
    `, [limit]);
    recommendations.discussions = discussionRes.rows;

    return recommendations;
  } catch (err) {
    console.error("Shared recommendations error:", err);
    return recommendations;
  }
};
