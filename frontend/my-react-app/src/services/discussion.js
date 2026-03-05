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
export const getDiscussion = async (id) => {
  const response = await api.get(`/discussions/${id}`);
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

// Delete a discussion
export const deleteDiscussion = async (id) => {
  const response = await api.delete(`/discussions/${id}`);
  return response.data;
};

// Add a comment
export const addComment = async (discussionId, content) => {
  const response = await api.post(`/discussions/${discussionId}/comments`, {
    content,
  });
  return response.data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/discussions/comments/${commentId}`);
  return response.data;
};

// Toggle like
export const toggleLike = async (discussionId) => {
  const response = await api.post(`/discussions/${discussionId}/like`);
  return response.data;
};

// Toggle save
export const toggleSave = async (discussionId) => {
  const response = await api.post(`/discussions/${discussionId}/save`);
  return response.data;
};
