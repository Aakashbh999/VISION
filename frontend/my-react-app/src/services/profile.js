import api from "./api";

const profileService = {
  // Get public profile by user ID
  getPublicProfile: async (userId) => {
    const response = await api.get(`/api/profile/${userId}`);
    return response.data;
  },

  // Get own profile (requires auth)
  getOwnProfile: async () => {
    const response = await api.get("/api/profile/me");
    return response.data;
  },

  // Update bio
  updateBio: async (bio) => {
    const response = await api.patch("/api/profile/bio", { bio });
    return response.data;
  },

  // Update profile fields in one request
  updateProfile: async (payload) => {
    const response = await api.patch("/api/profile/me", payload);
    return response.data;
  },

  // Update profile image
  updateProfileImage: async (formData) => {
    const response = await api.post("/api/profile/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update banner image
  updateProfileBanner: async (formData) => {
    const response = await api.post("/api/profile/banner", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Remove profile image
  removeProfileImage: async () => {
    const response = await api.delete("/api/profile/image");
    return response.data;
  },

  // Remove banner image
  removeProfileBanner: async () => {
    const response = await api.delete("/api/profile/banner");
    return response.data;
  },

  // Follow user
  followUser: async (userId) => {
    const response = await api.post(`/api/profile/${userId}/follow`);
    return response.data;
  },

  // Unfollow user
  unfollowUser: async (userId) => {
    const response = await api.delete(`/api/profile/${userId}/follow`);
    return response.data;
  },

  // Get followers
  getFollowers: async (userId) => {
    const response = await api.get(`/api/profile/${userId}/followers`);
    return response.data;
  },

  // Get following
  getFollowing: async (userId) => {
    const response = await api.get(`/api/profile/${userId}/following`);
    return response.data;
  },
};

export default profileService;
