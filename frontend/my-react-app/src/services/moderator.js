import { httpGet, httpPatch } from "./http";

export const getPendingResources = async (page = 1, limit = 10, search = "") => {
  return httpGet("/admin/resources/pending", { page, limit, search });
};

export const approveResource = async (id) => {
  return httpPatch(`/admin/resources/${id}/approve`);
};

export const rejectResource = async (id, reason) => {
  return httpPatch(`/admin/resources/${id}/reject`, { reason });
};
