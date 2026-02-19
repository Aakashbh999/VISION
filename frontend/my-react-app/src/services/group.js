import api from "./api";

// Get all groups
export const getGroups = async () => {
  const response = await api.get("/groups");
  return response.data;
};

// Get single group details
export const getGroup = async (groupId) => {
  const response = await api.get(`/groups/${groupId}`);
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

// Get group posts
export const getGroupPosts = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/posts`);
  return response.data;
};

// Create a post in a group
export const createGroupPost = async (groupId, content) => {
  const response = await api.post(`/groups/${groupId}/posts`, { content });
  return response.data;
};
