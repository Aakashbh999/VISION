import api from "./api";

export const getDiscussions = async (filters = {}, signal) => {
  const params = new URLSearchParams();

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

  const response = await api.get(`/discussions?${params.toString()}`, {
    signal,
  });
  return response.data;
};

export const getDiscussion = async (id, sort = "newest") => {
  const response = await api.get(`/discussions/${id}?sort=${sort}`);
  return response.data;
};

export const getTrendingDiscussions = async (limit = 10) => {
  const response = await api.get(`/discussions/trending?limit=${limit}`);
  return response.data;
};

export const getTags = async () => {
  const response = await api.get("/discussions/tags");
  return response.data;
};

export const getUserDefaults = async () => {
  const response = await api.get("/discussions/user/defaults");
  return response.data;
};

export const getSavedDiscussions = async (page = 1, limit = 20) => {
  const response = await api.get(
    `/discussions/user/saved?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const getMyPosts = async (page = 1, limit = 20) => {
  const response = await api.get(
    `/discussions/user/my-posts?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const createDiscussion = async (data) => {
  const response = await api.post("/discussions", data);
  return response.data;
};

export const updateDiscussion = async (id, data) => {
  const response = await api.put(`/discussions/${id}`, data);
  return response.data;
};

export const deleteDiscussion = async (id, reason) => {
  const response = await api.delete(`/discussions/${id}`, {
    data: { reason },
  });
  return response.data;
};

export const hardDeleteDiscussion = async (id) => {
  const response = await api.delete(`/discussions/${id}/hard`);
  return response.data;
};

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

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/discussions/comments/${commentId}`);
  return response.data;
};

export const softDeleteComment = async (commentId, reason) => {
  const response = await api.post(
    `/discussions/comments/${commentId}/soft-delete`,
    {
      reason,
    },
  );
  return response.data;
};

export const voteComment = async (commentId, voteType) => {
  const response = await api.post(`/discussions/comments/${commentId}/vote`, {
    vote_type: voteType,
  });
  return response.data;
};

export const voteDiscussion = async (discussionId, voteType) => {

  const response = await api.post(`/discussions/${discussionId}/vote`, {
    vote_type: voteType,
  });
  return response.data;
};

export const toggleLike = async (discussionId) => {
  return voteDiscussion(discussionId, 1);
};

export const toggleSave = async (discussionId) => {
  const response = await api.post(`/discussions/${discussionId}/save`);
  return response.data;
};

export const boostDiscussion = async (discussionId) => {
  const response = await api.post(`/discussions/${discussionId}/boost`);
  return response.data;
};

export const uploadDiscussionImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/discussions/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
