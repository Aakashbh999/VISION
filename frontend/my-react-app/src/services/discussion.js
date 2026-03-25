import api from "./api";

// Get all discussions (with filters and pagination)
export const getDiscussions = async (filters = {}) => {
  const params = new URLSearchParams();

  // Add filters to params
  if (filters.specialization)
    params.append("specialization", filters.specialization);
  if (filters.degree) params.append("degree", filters.degree);
  if (filters.jobRole) params.append("jobRole", filters.jobRole);
  if (filters.program) params.append("program", filters.program);
  if (filters.tag) params.append("tag", filters.tag);
  if (filters.search) params.append("search", filters.search);
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  const response = await api.get(`/discussions?${params.toString()}`);
  return response.data;
};

// Get single discussion with comments
export const getDiscussion = async (id, sort = "newest") => {
  const response = await api.get(`/discussions/${id}?sort=${sort}`);
  return response.data;
};

// Get trending discussions
export const getTrendingDiscussions = async (limit = 10) => {
  const response = await api.get(`/discussions/trending?limit=${limit}`);
  return response.data;
};

// Get all tags for filtering
export const getTags = async () => {
  const response = await api.get("/discussions/tags");
  return response.data;
};

// Get user's default filter preferences
export const getUserDefaults = async () => {
  const response = await api.get("/discussions/user/defaults");
  return response.data;
};

// Get user's saved discussions
export const getSavedDiscussions = async (page = 1, limit = 20) => {
  const response = await api.get(
    `/discussions/user/saved?page=${page}&limit=${limit}`,
  );
  return response.data;
};

// Get user's own posts
export const getMyPosts = async (page = 1, limit = 20) => {
  const response = await api.get(
    `/discussions/user/my-posts?page=${page}&limit=${limit}`,
  );
  return response.data;
};

// Create a new discussion
export const createDiscussion = async (data) => {
  const response = await api.post("/discussions", data);
  return response.data;
};

// Update a discussion (24-hour edit limit)
export const updateDiscussion = async (id, data) => {
  const response = await api.put(`/discussions/${id}`, data);
  return response.data;
};

// Delete a discussion (soft delete)
export const deleteDiscussion = async (id, reason) => {
  const response = await api.delete(`/discussions/${id}`, { data: { reason } });
  return response.data;
};

// Permanently delete a discussion (hard delete)
export const hardDeleteDiscussion = async (id) => {
  const response = await api.delete(`/discussions/${id}/hard`);
  return response.data;
};

// Add a comment
export const addComment = async (
  discussionId,
  content,
  parentId = null,
  website = "",
) => {
  const response = await api.post(`/discussions/${discussionId}/comments`, {
    content,
    parentId,
    website,
  });
  return response.data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/discussions/comments/${commentId}`);
  return response.data;
};

// Soft delete a comment (user-initiated, records reason)
export const softDeleteComment = async (commentId, reason) => {
  const response = await api.post(
    `/discussions/comments/${commentId}/soft-delete`,
    {
      reason,
    },
  );
  return response.data;
};

// Vote (Upvote/Downvote) on a comment
export const voteComment = async (commentId, voteType) => {
  const response = await api.post(`/discussions/comments/${commentId}/vote`, {
    vote_type: voteType,
  });
  return response.data;
};

// Vote (Upvote/Downvote)
export const voteDiscussion = async (discussionId, voteType) => {
  // voteType: 1 (Up), -1 (Down), 0 (Neutral/Reset)
  const response = await api.post(`/discussions/${discussionId}/vote`, {
    vote_type: voteType,
  });
  return response.data;
};

// Toggle like (Legacy, now uses vote service with type 1)
export const toggleLike = async (discussionId) => {
  return voteDiscussion(discussionId, 1);
};

// Toggle save
export const toggleSave = async (discussionId) => {
  const response = await api.post(`/discussions/${discussionId}/save`);
  return response.data;
};

// Boost a discussion
export const boostDiscussion = async (discussionId) => {
  const response = await api.post(`/discussions/${discussionId}/boost`);
  return response.data;
};

// Upload discussion image
export const uploadDiscussionImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/discussions/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
