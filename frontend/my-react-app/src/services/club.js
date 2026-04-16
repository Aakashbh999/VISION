import api from "./api";

// Get clubs with optional filters (using IT routes)
export const getClubs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", filters.page);
  if (filters.limit) params.set("limit", filters.limit);
  if (filters.search) params.set("search", filters.search);
  if (filters.specialty) params.set("specialty", filters.specialty);
  if (filters.institution) params.set("institution", filters.institution);

  const response = await api.get(`/it-clubs?${params.toString()}`);
  return {
    clubs: response.data.data,
    pagination: response.data.pagination,
  };
};

// Get single club details by slug
export const getClub = async (slug) => {
  const response = await api.get(`/it-clubs/${slug}`);
  return response.data;
};

// Join a club
export const joinClub = async (clubId) => {
  const response = await api.post(`/it-clubs/${clubId}/join`);
  return response.data;
};

// Leave a club
export const leaveClub = async (clubId) => {
  const response = await api.post(`/it-clubs/${clubId}/leave`);
  return response.data;
};
