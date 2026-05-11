import api from "./api";

export const getGroups = async ({ search, sort, degree, program } = {}) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  if (degree) params.set("degree", degree);
  if (program) params.set("program", program);
  const response = await api.get(`/groups?${params.toString()}`);
  return response.data;
};

export const getManagedGroups = async () => {
  const response = await api.get("/groups/managed");
  return response.data;
};

export const getGroup = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
  return response.data;
};

export const getGroupMembers = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/members`);
  return response.data;
};

export const createGroup = async (data) => {
  const response = await api.post("/groups", data);
  return response.data;
};

export const joinGroup = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/join`);
  return response.data;
};

export const leaveGroup = async (groupId) => {
  const response = await api.delete(`/groups/${groupId}/leave`);
  return response.data;
};

export const getGroupPosts = async (
  groupId,
  { limit = 20, before, after, section = "general" } = {},
) => {
  const params = new URLSearchParams();
  params.set("limit", limit);
  params.set("section", section);
  if (before) params.set("before", before);
  if (after) params.set("after", after);
  const response = await api.get(
    `/groups/${groupId}/posts?${params.toString()}`,
  );

  const data = response.data || {};

  return {
    messages: Array.isArray(data.messages) ? data.messages : [],
    hasMore: data.hasMore || false,
    oldestId: data.oldestId || null,
    latestId: data.latestId || null,
  };
};

export const createGroupPost = async (groupId, payload) => {
  const hasFile = payload?.file instanceof File;
  const body = hasFile ? new FormData() : {};

  const appendValue = (key, value) => {
    if (value === undefined || value === null || value === "") return;
    if (hasFile) {
      body.append(key, value);
    } else {
      body[key] = value;
    }
  };

  appendValue("content", payload?.content);
  appendValue("section", payload?.section || "general");
  appendValue("qa_post_type", payload?.qa_post_type);
  appendValue("qa_question_post_id", payload?.qa_question_post_id);
  if (hasFile) {
    body.append("file", payload.file);
  }

  const response = await api.post(`/groups/${groupId}/posts`, body, {
    headers: hasFile ? { "Content-Type": "multipart/form-data" } : undefined,
  });
  return response.data;
};

export const updateGroup = async (groupId, data) => {
  const response = await api.patch(`/groups/${groupId}`, data);
  return response.data;
};

export const updateGroupImage = async (groupId, formData) => {
  const response = await api.post(`/groups/${groupId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateGroupBanner = async (groupId, formData) => {
  const response = await api.post(`/groups/${groupId}/banner`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteGroup = async (groupId) => {
  const response = await api.delete(`/groups/${groupId}`);
  return response.data;
};

export const requestToJoin = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/request-join`);
  return response.data;
};

export const getJoinRequests = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/join-requests`);
  return response.data;
};

export const approveJoinRequest = async (groupId, requestId) => {
  const response = await api.post(
    `/groups/${groupId}/join-requests/${requestId}/approve`,
  );
  return response.data;
};

export const declineJoinRequest = async (groupId, requestId) => {
  const response = await api.post(
    `/groups/${groupId}/join-requests/${requestId}/decline`,
  );
  return response.data;
};

export const appointCoAdmin = async (groupId, memberId) => {
  const response = await api.post(
    `/groups/${groupId}/members/${memberId}/appoint-co-admin`,
  );
  return response.data;
};

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

export const expandCapacity = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/expand-capacity`);
  return response.data;
};

export const softDeleteGroup = async (groupId, reason) => {
  const response = await api.post(`/groups/${groupId}/soft-delete`, {
    reason,
  });
  return response.data;
};

export const softDeleteGroupPost = async (postId, reason) => {
  const response = await api.post(`/groups/posts/${postId}/soft-delete`, {
    reason,
  });
  return response.data;
};

export const updateGroupQaAnswer = async (postId, content) => {
  const response = await api.patch(`/groups/posts/${postId}/answer`, { content });
  return response.data;
};

export const inviteMember = async (groupId, userId) => {
  const response = await api.post(`/groups/${groupId}/invitations`, { userId });
  return response.data;
};

export const acceptInvitation = async (invitationId) => {
  const response = await api.post(`/groups/invitations/${invitationId}/accept`);
  return response.data;
};

export const rejectInvitation = async (invitationId) => {
  const response = await api.post(`/groups/invitations/${invitationId}/reject`);
  return response.data;
};

export const removeMember = async (groupId, memberId) => {
  const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
  return response.data;
};
