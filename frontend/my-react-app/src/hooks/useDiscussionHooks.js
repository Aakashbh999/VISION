import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getDiscussion,
  getDiscussions,
  getTags,
  getUserDefaults,
  updateDiscussion,
  deleteDiscussion,
  hardDeleteDiscussion,
  deleteComment,
  boostDiscussion,
  getSavedDiscussions,
  getTrendingDiscussions,
  getMyPosts,
  createDiscussion,
  voteDiscussion,
  voteComment,
  toggleSave,
  addComment,
} from "../services/discussion";

export const useDiscussion = (id, sort = "newest") => {
  return useQuery({
    queryKey: ["discussion", id, sort],
    queryFn: () => getDiscussion(id, sort),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useDiscussions = (filters = {}) => {
  return useQuery({
    queryKey: ["discussions", filters],
    queryFn: () => getDiscussions(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useDiscussionTags = () => {
  return useQuery({
    queryKey: ["discussion-tags"],
    queryFn: () => getTags(),
    staleTime: 30 * 60 * 1000, // 30 minutes - tags don't change often
  });
};

export const useUserFilterDefaults = () => {
  return useQuery({
    queryKey: ["user-filter-defaults"],
    queryFn: () => getUserDefaults(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useUpdateDiscussion = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => updateDiscussion(discussionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", discussionId]);
      queryClient.invalidateQueries(["discussions"]);
      queryClient.invalidateQueries(["my-posts"]);
    },
  });
};

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discussionId) => deleteDiscussion(discussionId),
    onSuccess: () => {
      toast.success("Post archived");
      queryClient.invalidateQueries(["discussions"]);
      queryClient.invalidateQueries(["my-posts"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to archive post");
    }
  });
};

export const useHardDeleteDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discussionId) => hardDeleteDiscussion(discussionId),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussions"]);
      queryClient.invalidateQueries(["my-posts"]);
    },
  });
};

export const useDeleteComment = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", discussionId]);
    },
  });
};

export const useBoostDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discussionId) => boostDiscussion(discussionId),
    onSuccess: (data, discussionId) => {
      toast.success(data?.message || "Discussion boosted!");
      queryClient.invalidateQueries(["discussion", discussionId]);
      queryClient.invalidateQueries(["discussions"]);
      queryClient.invalidateQueries(["trending-discussions"]);
      queryClient.invalidateQueries(["my-posts"]);
      // also invalidate profile to update reputation points
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to boost discussion");
    }
  });
};

export const useSavedDiscussions = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["saved-discussions", page, limit],
    queryFn: () => getSavedDiscussions(page, limit),
    staleTime: 2 * 60 * 1000,
  });
};

export const useTrendingDiscussions = (limit = 10) => {
  return useQuery({
    queryKey: ["trending-discussions", limit],
    queryFn: () => getTrendingDiscussions(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useMyPosts = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["my-posts", page, limit],
    queryFn: () => getMyPosts(page, limit),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateDiscussion = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: createDiscussion,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["discussions"]);
      navigate(`/portal/discussions/${data.discussion_id}`);
    },
  });
};

export const useAddComment = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, parentId, website }) => addComment(discussionId, content, parentId, website),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", discussionId]);
    },
  });
};

export const useVote = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (voteType) => voteDiscussion(discussionId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", discussionId]);
      queryClient.invalidateQueries(["discussions"]);
    },
  });
};

export const useCommentVote = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, voteType }) => voteComment(commentId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", discussionId]);
    },
  });
};

export const useToggleLike = (discussionId) => {
  return useVote(discussionId);
};

export const useToggleSave = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleSave(discussionId),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", discussionId]);
      queryClient.invalidateQueries(["discussions"]);
      queryClient.invalidateQueries(["saved-discussions"]);
    },
  });
};



