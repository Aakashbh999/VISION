-- ============================================================================
-- RECOMMENDATION ENGINE EVALUATION QUERY
-- ============================================================================
-- This script evaluates the recommendation algorithm across all users
-- and collects performance metrics

-- ============================================================================
-- METRIC 1: Program Match Rate & Tag Overlap
-- ============================================================================

WITH recommendation_metrics AS (
  WITH user_info AS (
    SELECT user_id, program_id FROM portal.users WHERE user_id BETWEEN 1 AND 30
  ),
  user_interests AS (
    SELECT ui.user_id, array_agg(t.tag_id) as interest_tag_ids
    FROM portal.user_interests ui
    JOIN portal.tags t ON t.tag_id = ui.tag_id
    WHERE ui.user_id BETWEEN 1 AND 30
    GROUP BY ui.user_id
  ),
  recommendations AS (
    SELECT 
      u.user_id,
      u.program_id,
      r.resource_id,
      r.program_id as resource_program_id,
      r.title,
      -- Score calculation
      (CASE WHEN r.program_id = u.program_id THEN 40 ELSE 0 END +
       COALESCE((SELECT COUNT(*) FROM portal.resource_tags rt 
                 WHERE rt.resource_id = r.resource_id 
                 AND rt.tag_id = ANY(ui.interest_tag_ids)) * 10, 0) +
       COALESCE((SELECT COUNT(*) FROM portal.user_resource_interactions uri 
                 WHERE uri.resource_id = r.resource_id) * 2, 0) -
       CASE WHEN EXISTS (SELECT 1 FROM portal.user_resource_interactions 
                         WHERE user_id = u.user_id AND resource_id = r.resource_id 
                         AND interaction_type = 'completed') THEN 50 ELSE 0 END) AS score,
      -- Program match
      CASE WHEN r.program_id = u.program_id THEN 1 ELSE 0 END as program_match,
      -- Tag overlap count
      COALESCE((SELECT COUNT(*) FROM portal.resource_tags rt 
               WHERE rt.resource_id = r.resource_id 
               AND rt.tag_id = ANY(ui.interest_tag_ids)), 0) as tag_overlap,
      -- Global popularity
      COALESCE((SELECT COUNT(*) FROM portal.user_resource_interactions uri 
               WHERE uri.resource_id = r.resource_id), 0) as popularity_score
    FROM user_info u
    JOIN user_interests ui ON u.user_id = ui.user_id
    CROSS JOIN portal.resources r
    WHERE r.status = 'approved'
    ORDER BY u.user_id, score DESC
  ),
  top_recommendations AS (
    SELECT *,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY score DESC) as rec_rank
    FROM recommendations
    WHERE score > 0
  )
  SELECT 
    user_id,
    program_id,
    COUNT(*) as recommendations_count,
    ROUND(100.0 * SUM(program_match) / NULLIF(COUNT(*), 0), 2) as program_match_rate,
    ROUND(AVG(tag_overlap), 2) as avg_tag_overlap,
    ROUND(AVG(popularity_score), 2) as avg_popularity_score
  FROM top_recommendations
  WHERE rec_rank <= 10
  GROUP BY user_id, program_id
)
SELECT 
  'CSIT' as program,
  COUNT(*) as user_count,
  ROUND(AVG(program_match_rate), 2) as avg_program_match_rate,
  ROUND(AVG(avg_tag_overlap), 2) as avg_tag_overlap,
  ROUND(AVG(avg_popularity_score), 2) as avg_popularity_score
FROM recommendation_metrics
WHERE program_id = 1
UNION ALL
SELECT 
  'BIT' as program,
  COUNT(*) as user_count,
  ROUND(AVG(program_match_rate), 2) as avg_program_match_rate,
  ROUND(AVG(avg_tag_overlap), 2) as avg_tag_overlap,
  ROUND(AVG(avg_popularity_score), 2) as avg_popularity_score
FROM recommendation_metrics
WHERE program_id = 2
UNION ALL
SELECT 
  'BCA' as program,
  COUNT(*) as user_count,
  ROUND(AVG(program_match_rate), 2) as avg_program_match_rate,
  ROUND(AVG(avg_tag_overlap), 2) as avg_tag_overlap,
  ROUND(AVG(avg_popularity_score), 2) as avg_popularity_score
FROM recommendation_metrics
WHERE program_id = 3;

-- ============================================================================
-- METRIC 2: Diversity Score (Unique Tags in Top 10)
-- ============================================================================

WITH user_recommendations AS (
  WITH user_interests AS (
    SELECT ui.user_id, array_agg(t.tag_id) as interest_tag_ids
    FROM portal.user_interests ui
    JOIN portal.tags t ON t.tag_id = ui.tag_id
    WHERE ui.user_id BETWEEN 1 AND 30
    GROUP BY ui.user_id
  ),
  recommendations AS (
    SELECT 
      u.user_id,
      u.program_id,
      r.resource_id,
      (CASE WHEN r.program_id = u.program_id THEN 40 ELSE 0 END +
       COALESCE((SELECT COUNT(*) FROM portal.resource_tags rt 
                 WHERE rt.resource_id = r.resource_id 
                 AND rt.tag_id = ANY(ui.interest_tag_ids)) * 10, 0) +
       COALESCE((SELECT COUNT(*) FROM portal.user_resource_interactions uri 
                 WHERE uri.resource_id = r.resource_id) * 2, 0)) AS score
    FROM (SELECT user_id, program_id FROM portal.users WHERE user_id BETWEEN 1 AND 30) u
    JOIN user_interests ui ON u.user_id = ui.user_id
    CROSS JOIN portal.resources r
    WHERE r.status = 'approved'
  ),
  top_10 AS (
    SELECT 
      user_id,
      program_id,
      resource_id,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY score DESC) as rec_rank
    FROM recommendations
    WHERE score > 0
  ),
  tag_diversity AS (
    SELECT 
      t10.user_id,
      t10.program_id,
      COUNT(DISTINCT rt.tag_id) as unique_tags,
      COUNT(DISTINCT rt.tag_id)::float / NULLIF((SELECT COUNT(DISTINCT tag_id) FROM portal.tags WHERE tag_type = 'custom'), 0) * 100 as diversity_percentage
    FROM top_10 t10
    LEFT JOIN portal.resource_tags rt ON rt.resource_id = t10.resource_id
    WHERE t10.rec_rank <= 10
    GROUP BY t10.user_id, t10.program_id
  )
  SELECT 
    CASE 
      WHEN program_id = 1 THEN 'CSIT'
      WHEN program_id = 2 THEN 'BIT'
      WHEN program_id = 3 THEN 'BCA'
    END as program,
    ROUND(AVG(diversity_percentage), 2) as avg_diversity_percentage,
    ROUND(AVG(unique_tags), 2) as avg_unique_tags
  FROM tag_diversity
  GROUP BY program_id
)
SELECT * FROM user_recommendations;

-- ============================================================================
-- METRIC 3: Query Execution Performance Analysis
-- ============================================================================

-- Performance baseline: Single user recommendation query
EXPLAIN ANALYZE
WITH user_tags AS (
  SELECT tag_id FROM portal.user_interests WHERE user_id = 1
)
SELECT r.resource_id, r.title,
       CASE WHEN r.program_id = 1 THEN 40 ELSE 0 END
       + (SELECT COUNT(*) FROM portal.resource_tags rt WHERE rt.resource_id = r.resource_id AND rt.tag_id IN (SELECT tag_id FROM user_tags)) * 10
       + (SELECT COUNT(*) FROM portal.user_resource_interactions uri WHERE uri.resource_id = r.resource_id) * 2
       - CASE WHEN EXISTS (SELECT 1 FROM portal.user_resource_interactions WHERE user_id = 1 AND resource_id = r.resource_id AND interaction_type = 'completed') THEN 50 ELSE 0 END AS score
FROM portal.resources r
WHERE r.status = 'approved'
ORDER BY score DESC
LIMIT 10;

-- ============================================================================
-- DATA GENERATION VERIFICATION
-- ============================================================================

-- Verify test data was created correctly
SELECT 
  (SELECT COUNT(*) FROM portal.users WHERE user_id BETWEEN 1 AND 30) as total_users,
  (SELECT COUNT(*) FROM portal.resources WHERE created_by BETWEEN 1 AND 30 AND status = 'approved') as total_approved_resources,
  (SELECT COUNT(*) FROM portal.discussions WHERE user_id BETWEEN 1 AND 30) as total_discussions,
  (SELECT COUNT(*) FROM portal.user_resource_interactions) as total_interactions,
  (SELECT COUNT(*) FROM portal.user_interests) as total_user_interests;

-- Distribution verification by program
SELECT 
  p.program_id,
  p.name as program_name,
  COUNT(DISTINCT u.user_id) as user_count,
  COUNT(DISTINCT r.resource_id) as resource_count,
  COUNT(DISTINCT d.discussion_id) as discussion_count
FROM portal.programs p
LEFT JOIN portal.users u ON u.program_id = p.program_id AND u.user_id BETWEEN 1 AND 30
LEFT JOIN portal.resources r ON r.created_by IN (SELECT user_id FROM portal.users WHERE program_id = p.program_id AND user_id BETWEEN 1 AND 30) AND r.status = 'approved'
LEFT JOIN portal.discussions d ON d.program_id = p.program_id AND d.user_id BETWEEN 1 AND 30
WHERE p.program_id IN (1, 2, 3)
GROUP BY p.program_id, p.name;

-- Tag distribution in resources
SELECT 
  t.name as tag_name,
  COUNT(*) as resource_count
FROM portal.resource_tags rt
JOIN portal.tags t ON t.tag_id = rt.tag_id
WHERE rt.resource_id IN (SELECT resource_id FROM portal.resources WHERE created_by BETWEEN 1 AND 30)
GROUP BY t.name
ORDER BY resource_count DESC;
