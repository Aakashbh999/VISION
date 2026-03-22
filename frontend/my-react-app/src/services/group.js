import api from "./api";

// Get all groups with optional filters
export const getGroups = async ({ search, sort } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  const response = await api.get(`/groups?${params.toString()}`);
  return response.data;
};

// Get single group details
export const getGroup = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
};

// Get group members
export const getGroupMembers = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/members`);
  return response.data;
};

// Create a new group
export const createGroup = async (data) => {
  const response = await api.post("/groups", data);
  return response.data;
};

// Join a group
export const joinGroup = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/join`);
  return response.data;
};

// Leave a group
export const leaveGroup = async (groupId) => {
  const response = await api.delete(`/groups/${groupId}/leave`);
  return response.data;
};

// Get group posts with pagination
export const getGroupPosts = async (
  groupId,
  { limit = 20, before, section = "general" } = {},
) => {
  const params = new URLSearchParams();
  params.set("limit", limit);
  params.set("section", section);
  if (before) params.set("before", before);
  const response = await api.get(
    `/groups/${groupId}/posts?${params.toString()}`,
  );

  const data = response.data || {};

  return {
    messages: Array.isArray(data.messages) ? data.messages : [],
    hasMore: data.hasMore || false,
    oldestId: data.oldestId || null,
  };
};

// Create a post in a group
export const createGroupPost = async (
  groupId,
  content,
  section = "general",
) => {
  const response = await api.post(`/groups/${groupId}/posts`, {
    content,
    section,
  });
  return response.data;
};

// --- New Core Features ---

// Update group settings (name, description, privacy_type)
export const updateGroup = async (groupId, data) => {
  const response = await api.patch(`/groups/${groupId}`, data);
  return response.data;
};

// Update group image (with VXP/cooldown bypass body properties)
export const updateGroupImage = async (groupId, formData) => {
  const response = await api.post(`/groups/${groupId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Update group banner (with VXP/cooldown bypass body properties)
export const updateGroupBanner = async (groupId, formData) => {
  const response = await api.post(`/groups/${groupId}/banner`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Delete group
export const deleteGroup = async (groupId) => {
  const response = await api.delete(`/groups/${groupId}`);
  return response.data;
};

// Request to join a request-only group
export const requestToJoin = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/request-join`);
  return response.data;
};

// Get pending join requests (admin/owner only)
export const getJoinRequests = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/join-requests`);
  return response.data;
};

// Approve join request
export const approveJoinRequest = async (groupId, requestId) => {
  const response = await api.post(
    `/groups/${groupId}/join-requests/${requestId}/approve`,
  );
  return response.data;
};

// Decline join request
export const declineJoinRequest = async (groupId, requestId) => {
  const response = await api.post(
    `/groups/${groupId}/join-requests/${requestId}/decline`,
  );
  return response.data;
};

// Appoint co-admin
export const appointCoAdmin = async (groupId, memberId) => {
  const response = await api.post(
    `/groups/${groupId}/members/${memberId}/appoint-co-admin`,
  );
  return response.data;
};

// Remove co-admin
export const removeCoAdmin = async (groupId, memberId) => {
  const response = await api.delete(
    `/groups/${groupId}/members/${memberId}/co-admin`,
  );
  return response.data;
};

export const updateCoAdminPermissions = async (
  groupId,
  memberId,
  permissions,
) => {
  const response = await api.patch(
    `/groups/${groupId}/members/${memberId}/permissions`,
    permissions,
  );
  return response.data;
};

// Expand capacity using VXP
export const expandCapacity = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/expand-capacity`);
  return response.data;
};

// Soft delete group (user-initiated) — records deletion + reason
export const softDeleteGroup = async (groupId, reason) => {
  const response = await api.post(`/groups/${groupId}/soft-delete`, { reason });
  return response.data;
};

// Soft delete group post (user-initiated) — records deletion + reason
export const softDeleteGroupPost = async (postId, reason) => {
  const response = await api.post(`/groups/posts/${postId}/soft-delete`, {
    reason,
  });
  return response.data;
};
