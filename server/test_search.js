const pool = require("./config/db");
async function test() {
  try {
    const searchTerm = 'react';
    console.log("Testing Discussions...");
    await pool.query(`SELECT 
          d.discussion_id as id,
          d.title,
          d.content as description,
          d.like_count,
          d.comment_count,
          COALESCE(
            (SELECT array_agg(t.name) 
             FROM portal.discussion_tags dt 
             JOIN portal.tags t ON t.tag_id = dt.tag_id 
             WHERE dt.discussion_id = d.discussion_id), 
            ARRAY[]::text[]
          ) as tags,
          'discussion' as type
        FROM portal.discussions d
        WHERE d.deleted_at IS NULL AND (
          d.title % $1 
          OR d.content % $1
          OR d.title ILIKE $2
          OR d.content ILIKE $2
          OR EXISTS (
            SELECT 1 FROM portal.discussion_tags dt 
            JOIN portal.tags t ON t.tag_id = dt.tag_id 
            WHERE dt.discussion_id = d.discussion_id AND (t.name % $1 OR t.name ILIKE $2)
          )
        )
        ORDER BY 
          similarity(d.title, $1) DESC,
          (d.like_count * 2 + d.comment_count) DESC,
          d.title
        LIMIT $3`, [searchTerm, `%${searchTerm}%`, 5]);
    console.log("Testing Suggestions...");
    await pool.query(`SELECT DISTINCT suggestion, type, similarity(suggestion, $1) as sim FROM (
        SELECT title as suggestion, 'roadmap' as type FROM portal.roadmaps WHERE (title % $1 OR title ILIKE $2) AND is_active = TRUE
        UNION ALL
        SELECT name as suggestion, 'group' as type FROM portal.study_groups WHERE (name % $1 OR name ILIKE $2) AND deleted_at IS NULL
        UNION ALL
        SELECT title as suggestion, 'resource' as type FROM portal.resources WHERE (title % $1 OR title ILIKE $2) AND status = 'approved' AND deleted_at IS NULL
        UNION ALL
        SELECT title as suggestion, 'discussion' as type FROM portal.discussions WHERE (title % $1 OR title ILIKE $2) AND deleted_at IS NULL
      ) combined
      ORDER BY sim DESC, suggestion
      LIMIT 8`, ['a', '%a%']);
    console.log("Testing Groups...");
    await pool.query(`SELECT 
          g.group_id as id,
          g.name,
          g.description,
          g.group_image,
          g.is_public,
          g.degree_id,
          ad.full_name as degree_name,
          COUNT(DISTINCT gm.user_id) as member_count,
          FALSE AS is_member,
          'group' as type
        FROM portal.study_groups g
        LEFT JOIN portal.group_members gm ON gm.group_id = g.group_id
        LEFT JOIN portal.academic_degrees ad ON ad.id = g.degree_id
        WHERE g.deleted_at IS NULL AND (
          g.name % $1 
          OR g.description % $1
          OR g.name ILIKE $2
          OR g.description ILIKE $2
        )
        GROUP BY g.group_id, g.name, g.description, g.group_image, g.is_public, g.degree_id, ad.full_name
        ORDER BY 
          similarity(g.name, $1) DESC,
          g.name
        LIMIT $3`, [searchTerm, `%${searchTerm}%`, 5]);
    console.log("Testing Resources...");
    await pool.query(`SELECT 
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
        WHERE r.status = 'approved' AND r.deleted_at IS NULL AND (
            r.title % $1 
            OR r.description % $1
            OR r.title ILIKE $2
            OR r.description ILIKE $2
            OR EXISTS (
              SELECT 1 FROM portal.resource_tags rt 
              JOIN portal.tags t ON t.tag_id = rt.tag_id 
              WHERE rt.resource_id = r.resource_id AND (t.name % $1 OR t.name ILIKE $2)
            )
          )
        GROUP BY r.resource_id, r.title, r.description, r.semester, r.program_id, rs.avg_score
        ORDER BY 
          similarity(r.title, $1) DESC,
          COALESCE(rs.avg_score, 0) DESC,
          r.title
        LIMIT $3`, [searchTerm, `%${searchTerm}%`, 5]);
    console.log("All OK!");
  } catch (err) {
    console.error("DB Error:", err.message);
  } finally {
    process.exit(0);
  }
}
test();
