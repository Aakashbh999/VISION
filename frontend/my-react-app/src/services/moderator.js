import { httpGet, httpPatch } from "./http";

// Get pending resources for moderation
export const getPendingResources = async (page = 1, limit = 10, search = "") => {
  return httpGet("/admin/resources/pending", { page, limit, search });
};

// Approve a resource
export const approveResource = async (id) => {
  return httpPatch(`/admin/resources/${id}/approve`);
};

// Reject a resource
export const rejectResource = async (id, reason) => {
  return httpPatch(`/admin/resources/${id}/reject`, { reason });
};
