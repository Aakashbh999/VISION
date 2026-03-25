import api from "./api";

// Get pending resources for moderation
export const getPendingResources = async (page = 1, limit = 10) => {
  const response = await api.get(
    `/api/admin/resources/pending?page=${page}&limit=${limit}`,
  );
  return response.data;
};

// Approve a resource
export const approveResource = async (id) => {
  const response = await api.patch(`/admin/resources/${id}/approve`);
  return response.data;
};

// Reject a resource
export const rejectResource = async (id, reason) => {
  const response = await api.patch(`/admin/resources/${id}/reject`, { reason });
  return response.data;
};
