const buildFilterConditions = (filters, startParamIndex = 1) => {
  const conditions = ["d.deleted_at IS NULL", "d.is_deleted = FALSE"];
  const params = [];
  let paramIndex = startParamIndex;

  if (filters.specialization) {
    conditions.push(`d.specialization_id = $${paramIndex}`);
    params.push(parseInt(filters.specialization, 10));
    paramIndex++;
  }
  if (filters.degree) {
    const degreeId = parseInt(filters.degree, 10);

    if (degreeId >= 1 && degreeId <= 5) {
      conditions.push(`(d.degree_id = $${paramIndex} OR d.program_id = $${paramIndex})`);
    } else {
      conditions.push(`d.degree_id = $${paramIndex}`);
    }
    params.push(degreeId);
    paramIndex++;
  }
  if (filters.jobRole) {
    conditions.push(`d.job_role_id = $${paramIndex}`);
    params.push(parseInt(filters.jobRole, 10));
    paramIndex++;
  }
  if (filters.program) {
    const programId = parseInt(filters.program, 10);

    if (programId >= 1 && programId <= 5) {
      conditions.push(`(d.program_id = $${paramIndex} OR d.degree_id = $${paramIndex})`);
    } else {
      conditions.push(`d.program_id = $${paramIndex}`);
    }
    params.push(programId);
    paramIndex++;
  }
  if (filters.tag) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM portal.discussion_tags dt
        JOIN portal.tags t ON t.tag_id = dt.tag_id
        WHERE dt.discussion_id = d.discussion_id
        AND t.slug = $${paramIndex}
      )
    `);
    params.push(filters.tag);
    paramIndex++;
  }
  if (filters.search) {
    conditions.push(
      `(d.title % $${paramIndex} OR d.content % $${paramIndex} OR d.title ILIKE $${paramIndex + 1} OR d.content ILIKE $${paramIndex + 1})`,
    );
    params.push(filters.search, `%${filters.search}%`);
    paramIndex += 2;
  }
  if (filters.userId) {
    conditions.push(`d.user_id = $${paramIndex}`);
    params.push(parseInt(filters.userId, 10));
    paramIndex++;
  }

  return { whereClause: conditions.join(" AND "), params, paramIndex };
};

const getSearchParamIndex = (filters) => {
  if (!filters.search) return 1;
  let idx = 1;
  if (filters.specialization) idx++;
  if (filters.degree) idx++;
  if (filters.jobRole) idx++;
  if (filters.program) idx++;
  if (filters.tag) idx++;
  return idx;
};

const buildSortClause = (
  sort,
  search = null,
  hasUserId = false,
  searchParamIndex = 1,
) => {
  const boostPriority = `CASE WHEN d.is_boosted = TRUE AND d.boosted_until > NOW() THEN 0 ELSE 1 END ASC`;

  if (search && (!sort || sort === "latest")) {
    return `ORDER BY ${boostPriority}, similarity(d.title, $${searchParamIndex}) DESC, d.created_at DESC`;
  }
  if (sort === "recommended" && hasUserId) {
    return `ORDER BY ${boostPriority}, relevance_score DESC, d.created_at DESC`;
  }

  switch (sort) {
    case "popular":
      return `ORDER BY ${boostPriority}, d.like_count DESC, d.created_at DESC`;
    case "discussed":
      return `ORDER BY ${boostPriority}, d.comment_count DESC, d.created_at DESC`;
    case "trending":
      return `ORDER BY ${boostPriority}, (d.like_count * 2 + d.comment_count) DESC, d.created_at DESC`;
    case "oldest":
      return "ORDER BY d.created_at ASC";
    default:
      return `ORDER BY ${boostPriority}, d.created_at DESC`;
  }
};

module.exports = {
  buildFilterConditions,
  buildSortClause,
  getSearchParamIndex,
};
