import api from "./api";

export const getRoadmaps = async (filters = {}) => {
  const response = await api.get("/roadmaps", { params: filters });
  return response.data;
};

export const getRoadmap = async (id) => {
  const response = await api.get(`/roadmaps/${id}`);
  return response.data;
};

export const getStepResources = async (id, stepId) => {
  const response = await api.get(`/roadmaps/${id}/steps/${stepId}/resources`);
  return response.data;
};

export const completeStep = async (stepId, data = {}) => {
  const response = await api.post(`/roadmaps/steps/${stepId}/complete`, data);
  return response.data;
};

export const getRoadmapPath = async (id) => {
  const response = await api.get(`/roadmaps/${id}/path`);
  return response.data;
};

export const getRoadmapProgress = async (roadmapId) => {
  const response = await api.get(`/roadmaps/${roadmapId}/progress`);
  return response.data;
};

export const trackStepResourceVisit = async (stepId, resourceId) => {
  const response = await api.post(`/roadmaps/steps/${stepId}/resources/${resourceId}/visit`);
  return response.data;
};

export const lockRoadmap = async (id) => {
  const response = await api.post(`/roadmaps/${id}/lock`);
  return response.data;
};

export const leaveRoadmap = async (id) => {
  const response = await api.post(`/roadmaps/${id}/leave`);
  return response.data;
};

export const getRoadmapStatus = async (id) => {
  const response = await api.get(`/roadmaps/${id}/status`);
  return response.data;
};
