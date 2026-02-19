import api from './api';

// Get clubs with optional filters
export const getClubs = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/clubs?${params}`);
  return response.data;
};

// Get single club details
export const getClub = async (id) => {
  const response = await api.get(`/clubs/${id}`);
  return response.data;
};

// Join a club
export const joinClub = async (clubId) => {
  const response = await api.post(`/clubs/${clubId}/join`);
  return response.data;
};

// Leave a club
export const leaveClub = async (clubId) => {
  const response = await api.delete(`/clubs/${clubId}/leave`);
  return response.data;
};