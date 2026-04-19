import api from "./api";

// Get all roadmaps with optional filters
export const getRoadmaps = async (filters = {}) => {
  const response = await api.get("/roadmaps", { params: filters });
  return response.data;
};

// Get a single roadmap with its steps and completion status
export const getRoadmap = async (id) => {
  const response = await api.get(`/roadmaps/${id}`);
  return response.data;
};

// Get resources for a specific step
export const getStepResources = async (id, stepId) => {
  const response = await api.get(`/roadmaps/${id}/steps/${stepId}/resources`);
  return response.data;
};

// Mark a step as completed with Proof of Work
export const completeStep = async (stepId, data = {}) => {
  const response = await api.post(`/roadmaps/steps/${stepId}/complete`, data);
  return response.data;
};

// Get roadmap path (subway map data)
export const getRoadmapPath = async (id) => {
  const response = await api.get(`/roadmaps/${id}/path`);
  return response.data;
};

// Get progress percentage for a roadmap
export const getRoadmapProgress = async (roadmapId) => {
  const response = await api.get(`/roadmaps/${roadmapId}/progress`);
  return response.data;
};

// Track resource interaction
export const trackStepResourceVisit = async (stepId, resourceId) => {
  const response = await api.post(`/roadmaps/steps/${stepId}/resources/${resourceId}/visit`);
  return response.data;
};

// Leave a roadmap (Anti-spam)
export const leaveRoadmap = async (id) => {
  const response = await api.post(`/roadmaps/${id}/leave`);
  return response.data;
};

// Get enrolment status
export const getRoadmapStatus = async (id) => {
  const response = await api.get(`/roadmaps/${id}/status`);
  return response.data;
};
