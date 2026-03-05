import api from "./api";

// Get all roadmaps for the student's program
export const getRoadmaps = async () => {
  const response = await api.get("/roadmaps");
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

// Mark a step as completed
export const completeStep = async (stepId) => {
  const response = await api.post(`/roadmaps/steps/${stepId}/complete`);
  return response.data;
};

// Get progress percentage for a roadmap
export const getRoadmapProgress = async (roadmapId) => {
  const response = await api.get(`/roadmaps/${roadmapId}/progress`);
  return response.data;
};
