const pool = require("../config/db");
const { resolveFeedRankingConfig } = require("../utils/feedRankingConfig");
const catchAsync = require("../utils/catchAsync");

const buildRankedFeedQuery = ({ config, includeBreakdown = false }) => {
  const aw = config.actionWeights;
  const breakdownSelect = includeBreakdown
    ? `,
         r.action_weight,
         r.follow_weight,
         r.group_weight,
         r.degree_weight,
         r.program_weight,
         r.recency_weight,
         r.recommendation_weight`
    : "";

  return `WITH viewer AS (
      SELECT u.user_id, u.program_id, u.academic_degree_id
      FROM portal.users u
      WHERE u.user_id = $1
      LIMIT 1
    ),
    feed_base AS (
      SELECT
        af.activity_id,
        af.actor_user_id,
        af.action_type,
        af.reference_type,
        af.reference_id,
        af.metadata,
        af.created_at,
        actor.full_name AS actor_name,
        actor.profile_image AS actor_profile_image,
        viewer.user_id AS viewer_user_id,
        viewer.program_id AS viewer_program_id,
        viewer.academic_degree_id AS viewer_degree_id,
        EXISTS(
          SELECT 1
          FROM portal.user_followers uf
          WHERE uf.follower_id = viewer.user_id
            AND uf.following_id = af.actor_user_id
        ) AS is_following_actor,
        d.title AS discussion_title,
        d.degree_id AS discussion_degree_id,
        r.title AS resource_title,
        r.program_id AS resource_program_id,
        r.degree_id AS resource_degree_id,
        gp.group_id AS post_group_id,
        gp.section AS post_section,
        LEFT(gp.content, 140) AS post_preview,
        rs.title AS roadmap_step_title,
        sg.name AS group_name,
        COALESCE(
          NULLIF((af.metadata ->> 'group_id'), '')::INTEGER,
          gp.group_id,
          CASE
            WHEN af.reference_type = 'group' THEN af.reference_id
            ELSE NULL
          END
        ) AS event_group_id
      FROM portal.activity_feed af
      JOIN portal.users actor ON actor.user_id = af.actor_user_id
      CROSS JOIN viewer
      LEFT JOIN portal.discussions d
        ON af.reference_type = 'discussion'
       AND d.discussion_id = af.reference_id
       AND d.deleted_at IS NULL
       AND d.is_deleted = FALSE
      LEFT JOIN portal.resources r
        ON af.reference_type = 'resource'
       AND r.resource_id = af.reference_id
       AND r.deleted_at IS NULL
       AND r.status = 'approved'
      LEFT JOIN portal.group_posts gp
        ON af.reference_type = 'group_post'
       AND gp.post_id = af.reference_id
       AND gp.deleted_at IS NULL
      LEFT JOIN portal.roadmap_steps rs
        ON af.reference_type = 'roadmap_step'
       AND rs.step_id = af.reference_id
      -- Updated join: always join group for group_post and group
      LEFT JOIN portal.study_groups sg
        ON (
          (af.reference_type = 'group' AND sg.group_id = af.reference_id)
          OR
          (af.reference_type = 'group_post' AND gp.group_id = sg.group_id)
        )
      WHERE af.actor_user_id <> viewer.user_id
        AND ($2::text IS NULL OR af.action_type = $2)
        AND (
          $3::text IS NULL
          OR actor.full_name ILIKE '%' || $3 || '%'
          OR af.action_type ILIKE '%' || $3 || '%'
          OR COALESCE(d.title, r.title, rs.title, sg.name, '') ILIKE '%' || $3 || '%'
        )
        -- Tab-specific filtering logic
        AND (
          $6::text IS NULL OR $6 = 'for-you' OR
          ($6 = 'discussions' AND af.action_type = 'discussion_created') OR
          ($6 = 'groups' AND af.action_type IN ('group_notice_posted', 'group_posted')) OR
          ($6 = 'resources' AND af.action_type = 'resource_uploaded')
        )
        -- For You specific: Filter out noisy audit logs like 'followed' or 'joined' unless specifically requested
        AND (
          $6::text <> 'for-you' OR 
          af.action_type NOT IN ('group_join_approved', 'group_joined', 'user_followed', 'completed_step')
        )
    ),
    scored AS (
      SELECT
        fb.*,
        CASE
          WHEN fb.action_type = 'group_notice_posted' THEN ${aw.group_notice_posted}
          WHEN fb.action_type = 'resource_uploaded' THEN ${aw.resource_uploaded}
          WHEN fb.action_type = 'discussion_created' THEN ${aw.discussion_created}
          WHEN fb.action_type = 'group_posted' THEN ${aw.group_posted}
          WHEN fb.action_type = 'group_join_approved' THEN ${aw.group_join_approved}
          WHEN fb.action_type = 'group_joined' THEN ${aw.group_joined}
          WHEN fb.action_type = 'completed_step' THEN ${aw.completed_step}
          WHEN fb.action_type = 'boost' THEN ${aw.boost}
          WHEN fb.action_type = 'user_followed' THEN ${aw.user_followed}
          ELSE ${aw.default}
        END AS action_weight,
        CASE WHEN fb.is_following_actor THEN ${config.followWeight} ELSE 0 END AS follow_weight,
        CASE
          WHEN fb.event_group_id IS NOT NULL AND EXISTS (
            SELECT 1
            FROM portal.group_members gm
            WHERE gm.group_id = fb.event_group_id
              AND gm.user_id = fb.viewer_user_id
              AND gm.status = 'approved'
          )
          THEN ${config.groupWeight}
          ELSE 0
        END AS group_weight,
        CASE
          WHEN fb.viewer_degree_id IS NOT NULL
            AND (
              fb.discussion_degree_id = fb.viewer_degree_id
              OR fb.resource_degree_id = fb.viewer_degree_id
            )
          THEN ${config.degreeWeight}
          ELSE 0
        END AS degree_weight,
        CASE
          WHEN fb.viewer_program_id IS NOT NULL
            AND fb.resource_program_id = fb.viewer_program_id
          THEN ${config.programWeight}
          ELSE 0
        END AS program_weight,
        ${config.recencyBase} * EXP(
          -EXTRACT(EPOCH FROM (NOW() - fb.created_at)) / 3600.0 / ${config.recencyHalfLifeHours}
        ) AS recency_weight,
        CASE
          WHEN fb.reference_type = 'resource' AND EXISTS (
            SELECT 1
            FROM portal.resource_scores rs2
            WHERE rs2.user_id = fb.viewer_user_id
              AND rs2.resource_id = fb.reference_id
          )
          THEN LEAST(
            COALESCE((
              SELECT rs2.score
              FROM portal.resource_scores rs2
              WHERE rs2.user_id = fb.viewer_user_id
                AND rs2.resource_id = fb.reference_id
              ORDER BY rs2.score DESC
              LIMIT 1
            ), 0) / ${config.recommendationDivisor},
            ${config.recommendationCap}
          )
          ELSE 0
        END AS recommendation_weight
      FROM feed_base fb
    ),
    ranked AS (
      SELECT
        s.*,
        (
          s.action_weight
          + s.follow_weight
          + s.group_weight
          + s.degree_weight
          + s.program_weight
          + s.recency_weight
          + s.recommendation_weight
        )::numeric(10,2) AS relevance_score
      FROM scored s
    )
    SELECT
      r.activity_id,
      r.actor_user_id,
      r.actor_name,
      r.actor_profile_image,
      r.action_type,
      r.reference_type,
      r.reference_id,
      r.created_at,
      r.metadata,
      r.relevance_score,
      r.is_following_actor,
      COALESCE(
        r.discussion_title,
        r.resource_title,
        r.roadmap_step_title,
        r.post_preview,
        r.group_name,
        r.metadata ->> 'title'
    ) AS entity_title,
    r.group_name,
    r.event_group_id,
    r.post_section,
    r.post_preview,
    r.is_following_actor
    ${breakdownSelect},
    COUNT(*) OVER()::INTEGER AS total_count
  FROM ranked r
  ORDER BY r.relevance_score DESC, r.created_at DESC
  LIMIT $4 OFFSET $5`;
};

const fetchRankedFeed = async ({
  viewerId,
  actionType,
  search,
  limit,
  offset,
  tab, // Pass tab to the query
  config,
  includeBreakdown = false,
}) => {
  const sql = buildRankedFeedQuery({ config, includeBreakdown });
  return pool.query(sql, [viewerId, actionType, search, limit, offset, tab]);
};

exports.getFeed = catchAsync(async (req, res) => {
  const viewerId = req.user?.portal_user_id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const actionType = req.query.actionType
    ? String(req.query.actionType).trim()
    : null;
  const search = req.query.search ? String(req.query.search).trim() : null;
  const tab = req.query.tab ? String(req.query.tab).trim() : "for-you";
  const config = resolveFeedRankingConfig(req.query);

  const feedResult = await fetchRankedFeed({
    viewerId,
    actionType,
    search,
    limit,
    offset,
    tab,
    config,
    includeBreakdown: req.query.debug === "1",
  });

  const rows = feedResult.rows;
  const total = rows.length ? rows[0].total_count : 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const actionTypes = Array.from(new Set(rows.map((item) => item.action_type)));

  res.json({
    data: rows.map(({ total_count, ...rest }) => rest),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    meta: {
      actionTypes,
      weights: config,
    },
  });
});

exports.getFeedEvaluation = catchAsync(async (req, res) => {
  const viewerId = req.user?.portal_user_id;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const actionType = req.query.actionType
    ? String(req.query.actionType).trim()
    : null;
  const search = req.query.search ? String(req.query.search).trim() : null;
  const config = resolveFeedRankingConfig(req.query);

  const feedResult = await fetchRankedFeed({
    viewerId,
    actionType,
    search,
    limit,
    offset,
    config,
    includeBreakdown: true,
  });

  const rows = feedResult.rows;
  const total = rows.length ? rows[0].total_count : 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const actionDistribution = rows.reduce((acc, row) => {
    acc[row.action_type] = (acc[row.action_type] || 0) + 1;
    return acc;
  }, {});

  const avgScore =
    rows.length > 0
      ? Number(
          (
            rows.reduce(
              (sum, item) => sum + Number(item.relevance_score || 0),
              0,
            ) / rows.length
          ).toFixed(2),
        )
      : 0;

  res.json({
    weights: config,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    summary: {
      returnedCount: rows.length,
      averageScore: avgScore,
      actionDistribution,
    },
    samples: rows.map(({ total_count, ...rest }) => rest),
  });
});
