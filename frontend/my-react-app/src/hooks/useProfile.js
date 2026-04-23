import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import profileService from "../services/profile";
import { showToast } from "../utils/toast";

// Fetch public profile
export const usePublicProfile = (userId) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileService.getPublicProfile(userId),
    enabled: !!userId,
    retry: 1,
    refetchInterval: 60 * 1000,
    onError: (err) => {
      console.error(err);
      showToast.error("Failed to load profile.");
    },
  });
};

// Fetch own full profile
export const useOwnProfile = (options = {}) => {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileService.getOwnProfile,
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
    onError: (err) => {
      console.error(err);
    },
  });
};

// Update Bio
export const useUpdateBio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bio) => profileService.updateBio(bio),
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData(["profile", "me"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, bio: data.bio };
      });
      showToast.success("Bio updated.");
    },
    onError: (err) => {
      showToast.error(err.response?.data?.error || "Failed to update bio.");
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => profileService.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "me"], (oldData) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });
      showToast.success("Profile updated.");
    },
    onError: (err) => {
      showToast.error(err.response?.data?.error || "Failed to update profile.");
    },
  });
};

// Upload Images (Profile / Banner)
export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.updateProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      showToast.success("Profile picture updated.");
    },
    onError: (err) => {
      showToast.error(
        err.response?.data?.error || "Failed to update profile picture.",
      );
    },
  });
};

export const useUpdateProfileBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.updateProfileBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      showToast.success("Banner updated.");
    },
    onError: (err) => {
      showToast.error(err.response?.data?.error || "Failed to update banner.");
    },
  });
};

export const useRemoveProfileImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.removeProfileImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      showToast.success("Profile picture removed.");
    },
    onError: (err) => {
      showToast.error(
        err.response?.data?.error || "Failed to remove profile picture.",
      );
    },
  });
};

export const useRemoveProfileBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.removeProfileBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      showToast.success("Banner removed.");
    },
    onError: (err) => {
      showToast.error(err.response?.data?.error || "Failed to remove banner.");
    },
  });
};

// Follow / Unfollow logic
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isFollowing }) =>
      isFollowing
        ? profileService.unfollowUser(userId)
        : profileService.followUser(userId),
    onMutate: async ({ userId, isFollowing }) => {
      // URL params are strings — normalise to string to match the cache key
      const cacheKey = ["profile", String(userId)];
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previousProfile = queryClient.getQueryData(cacheKey);

      if (previousProfile) {
        queryClient.setQueryData(cacheKey, {
          ...previousProfile,
          is_following: !isFollowing,
          followers_count: isFollowing
            ? Math.max(0, parseInt(previousProfile.followers_count || 0) - 1)
            : parseInt(previousProfile.followers_count || 0) + 1,
        });
      }
      return { previousProfile, cacheKey };
    },
    onError: (err, _vars, context) => {
      showToast.error("Failed to update follow status.");
      if (context?.previousProfile && context?.cacheKey) {
        queryClient.setQueryData(context.cacheKey, context.previousProfile);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", String(variables.userId)],
      });
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["social"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
};

// Fetch system tags
export const useSystemTags = () => {
  return useQuery({
    queryKey: ["tags", "system"],
    queryFn: profileService.getSystemTags,
    staleTime: 60 * 60 * 1000, // They don't change often
  });
};
