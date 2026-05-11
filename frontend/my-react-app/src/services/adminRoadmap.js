import api from "./api";

export const getAdminRoadmaps = async () => {
  const response = await api.get("/admin/roadmaps");
  return response.data;
};

export const getAdminRoadmapById = async (id) => {
  const response = await api.get(`/admin/roadmaps/${id}`);
  return response.data;
};

export const createRoadmap = async (data) => {
  const response = await api.post("/admin/roadmaps", data);
  return response.data;
};

export const updateRoadmap = async (id, data) => {
  const response = await api.put(`/admin/roadmaps/${id}`, data);
  return response.data;
};

export const deleteRoadmap = async (id) => {
  const response = await api.delete(`/admin/roadmaps/${id}`);
  return response.data;
};

export const addRoadmapStep = async (roadmapId, data) => {
  const response = await api.post(`/admin/roadmaps/${roadmapId}/steps`, data);
  return response.data;
};

export const updateRoadmapStep = async (stepId, data) => {
  const response = await api.put(`/admin/roadmaps/steps/${stepId}`, data);
  return response.data;
};

export const deleteRoadmapStep = async (stepId) => {
  const response = await api.delete(`/admin/roadmaps/steps/${stepId}`);
  return response.data;
};

export const reorderRoadmapStep = async (stepId, direction) => {
  const response = await api.patch(`/admin/roadmaps/steps/${stepId}/reorder`, { direction });
  return response.data;
};

export const addResourceToStep = async (stepId, data) => {
  const response = await api.post(`/admin/roadmaps/steps/${stepId}/resources`, data);
  return response.data;
};

export const removeResourceFromStep = async (stepId, resourceId) => {
  const response = await api.delete(`/admin/roadmaps/steps/${stepId}/resources/${resourceId}`);
  return response.data;
};

export const getPendingRoadmapSubmissions = async () => {
  const response = await api.get("/admin/roadmaps/submissions/pending");
  return response.data;
};

export const reviewRoadmapSubmission = async (progressId, data) => {
  const response = await api.post(`/admin/roadmaps/submissions/${progressId}/review`, data);
  return response.data;
};
