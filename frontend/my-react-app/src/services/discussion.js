import api from './api';

// Get all discussions (with optional filters)
export const getDiscussions = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/discussions?${params}`);
  return response.data;
};

// Get single discussion with replies
export const getDiscussion = async (id) => {
  const response = await api.get(`/discussions/${id}`);
  return response.data;
};

// Create a new discussion
export const createDiscussion = async (data) => {
  const response = await api.post('/discussions', data);
  return response.data;
};

// Add a reply
export const replyToDiscussion = async (discussionId, content) => {
  const response = await api.post(`/discussions/${discussionId}/reply`, { content });
  return response.data;
};

// Toggle like
export const toggleLike = async (discussionId) => {
  const response = await api.post(`/discussions/${discussionId}/like`);
  return response.data;
};