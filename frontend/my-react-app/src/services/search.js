import api from "./api";

/**
 * Universal Search Service
 * Uses the unified /api/search endpoint for weighted multi-index search
 */

// Category definitions for consistent styling
export const SEARCH_CATEGORIES = {
  ROADMAPS: "Roadmaps",
  RESOURCES: "Resources",
  GROUPS: "Groups",
  CLUBS: "Clubs",
  DISCUSSIONS: "Discussions",
  USERS: "Users",
};

// Icon mapping for result types
const CATEGORY_ICONS = {
  roadmap: "map",
  resource: "file",
  group: "users",
  club: "users",
  user: "user",
};

const resolveEntityId = (entity, keys = [], fallback = "") => {
  for (const key of keys) {
    const value = entity?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return fallback;
};

/**
 * Transform API response to unified search result format
 */
const transformResults = (apiResponse) => {
  const results = [];

  // Process roadmaps
  if (apiResponse.roadmaps?.length) {
    apiResponse.roadmaps.forEach((r, idx) => {
      const roadmapId = resolveEntityId(r, ["id", "roadmap_id"], `idx-${idx}`);
      results.push({
        id: `roadmap-${roadmapId}`,
        title: r.title,
        category: SEARCH_CATEGORIES.ROADMAPS,
        path: r.path || `/roadmaps/${roadmapId}`,
        description: r.description || "",
        icon: CATEGORY_ICONS.roadmap,
        score: r.score,
        reason: r.reason,
        difficulty: r.difficulty_level,
      });
    });
  }

  // Process resources
  if (apiResponse.resources?.length) {
    apiResponse.resources.forEach((r, idx) => {
      const resourceId = resolveEntityId(
        r,
        ["id", "resource_id"],
        `idx-${idx}`,
      );
      results.push({
        id: `resource-${resourceId}`,
        title: r.title,
        category: SEARCH_CATEGORIES.RESOURCES,
        path: r.path || `/resources?id=${resourceId}`,
        description: r.description || r.resource_type || "",
        icon: CATEGORY_ICONS.resource,
        score: r.score,
        avgScore: r.avg_score,
        reason: r.reason,
        resourceType: r.resource_type,
        semester: r.semester,
        tags: r.tags,
        isTrending: r.isTrending,
      });
    });
  }

  // Process groups
  if (apiResponse.groups?.length) {
    apiResponse.groups.forEach((g, idx) => {
      const groupId = resolveEntityId(g, ["id", "group_id"], `idx-${idx}`);
      results.push({
        id: `group-${groupId}`,
        title: g.name,
        category: SEARCH_CATEGORIES.GROUPS,
        path: g.path || `/groups/${groupId}/profile`,
        description: g.description || "",
        icon: CATEGORY_ICONS.group,
        score: g.score,
        reason: g.reason,
        memberCount: g.member_count,
        isMember: g.is_member,
        groupImage: g.group_image,
        privacy_type: g.privacy_type,
      });
    });
  }

  // Process clubs
  if (apiResponse.clubs?.length) {
    apiResponse.clubs.forEach((c, idx) => {
      const clubId = resolveEntityId(
        c,
        ["id", "club_id", "slug"],
        `idx-${idx}`,
      );
      const subtitle = [c.specialty, c.institution, c.location]
        .filter(Boolean)
        .join(" • ");

      results.push({
        id: `club-${clubId}`,
        title: c.club_name || c.title || "Club",
        category: SEARCH_CATEGORIES.CLUBS,
        path: c.path || `/clubs/${c.slug || c.id}`,
        description: subtitle || c.description_full || "IT Club",
        icon: CATEGORY_ICONS.club,
        score: c.score,
        reason: c.reason,
      });
    });
  }

  // Process discussions
  if (apiResponse.discussions?.length) {
    apiResponse.discussions.forEach((d, idx) => {
      const discussionId = resolveEntityId(
        d,
        ["id", "discussion_id"],
        `idx-${idx}`,
      );
      results.push({
        id: `discussion-${discussionId}`,
        title: d.title,
        category: SEARCH_CATEGORIES.DISCUSSIONS,
        path: d.path || `/discussions/${discussionId}`,
        description: d.description || "",
        author: d.author || "",
        icon: "message-square",
        score: d.score,
      });
    });
  }

  // Process users
  if (apiResponse.users?.length) {
    apiResponse.users.forEach((u, idx) => {
      const userId = resolveEntityId(u, ["id", "user_id"], `idx-${idx}`);
      const subtitle = [u.campus, u.university].filter(Boolean).join(", ");

      results.push({
        id: `user-${userId}`,
        title: u.full_name,
        category: SEARCH_CATEGORIES.USERS,
        path: u.path || `/profile/${userId}`,
        description: subtitle || (u.role === "admin" ? "Admin" : "User"),
        icon: CATEGORY_ICONS.user,
        score: u.score,
        role: u.role,
        profilePicture: u.profile_picture,
      });
    });
  }

  return results;
};

/**
 * Get universal search results from the /api/search endpoint
 * @param {string} query - The search query (empty returns recommendations)
 * @param {number} limit - Max results per category (default 5)
 * @returns {Promise<Object>} - Search results with metadata
 */
export const getUniversalResults = async (query = "", limit = 5) => {
  try {
    const response = await api.get("/search", {
      params: { q: query.trim(), limit },
    });

    const data = response.data;
    const results = transformResults(data);

    return {
      results,
      query: data.query,
      isRecommendation: data.isRecommendation || false,
      total: data.total || results.length,
    };
  } catch (error) {
    console.error("Universal search error:", error);
    return {
      results: [],
      query,
      isRecommendation: false,
      total: 0,
      error: error.message,
    };
  }
};

/**
 * Get results grouped by category
 * @param {string} query - The search query
 * @returns {Promise<Object>} - Object with categories as keys and results arrays as values
 */
export const getGroupedResults = async (query) => {
  const { results } = await getUniversalResults(query);

  // Group by category
  return results.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
};

/**
 * Get quick search suggestions for autocomplete
 * @param {string} query - The partial search query
 * @returns {Promise<Array>} - Array of suggestion strings
 */
export const getSearchSuggestions = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await api.get("/search/suggestions", {
      params: { q: query.trim() },
    });
    return response.data.suggestions || [];
  } catch (error) {
    console.error("Search suggestions error:", error);
    return [];
  }
};

export default {
  getUniversalResults,
  getGroupedResults,
  getSearchSuggestions,
  SEARCH_CATEGORIES,
};
