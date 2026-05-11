import api from "./api";

const profileService = {

  getPublicProfile: async (userId) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  getOwnProfile: async () => {
    const response = await api.get("/profile/me");
    return response.data;
  },

  updateBio: async (bio) => {
    const response = await api.patch("/profile/bio", { bio });
    return response.data;
  },

  updateProfile: async (payload) => {
    const response = await api.patch("/profile/me", payload);
    return response.data;
  },

  updateProfileImage: async (formData) => {
    const response = await api.post("/profile/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateProfileBanner: async (formData) => {
    const response = await api.post("/profile/banner", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  removeProfileImage: async () => {
    const response = await api.delete("/profile/image");
    return response.data;
  },

  removeProfileBanner: async () => {
    const response = await api.delete("/profile/banner");
    return response.data;
  },

  followUser: async (userId) => {
    const response = await api.post(`/profile/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await api.delete(`/profile/${userId}/follow`);
    return response.data;
  },

  getFollowers: async (userId = "me", page = 1, limit = 12) => {
    const response = await api.get(`/profile/${userId}/followers`, {
      params: { page, limit },
    });
    return response.data;
  },

  getFollowing: async (userId = "me", page = 1, limit = 12) => {
    const response = await api.get(`/profile/${userId}/following`, {
      params: { page, limit },
    });
    return response.data;
  },

  getSystemTags: async () => {
    const response = await api.get("/tags/system");
    return response.data;
  },
};

export default profileService;
