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

const updateDiscussionVote = (discussion, nextVoteType) => {
  if (!discussion) return discussion;

  const previousVote = Number(discussion.user_vote || 0);
  const currentCount = Number(discussion.like_count || 0);

  let nextCount = currentCount;
  if (previousVote === 1 && nextVoteType !== 1) {
    nextCount -= 1;
  } else if (previousVote !== 1 && nextVoteType === 1) {
    nextCount += 1;
  }

  return {
    ...discussion,
    user_vote: nextVoteType,
    like_count: Math.max(0, nextCount),
  };
};

const updateCommentVoteTree = (comments, targetCommentId, nextVoteType) => {
  if (!Array.isArray(comments)) return comments;

  return comments.map((comment) => {
    if (String(comment.comment_id) === String(targetCommentId)) {
      const previousVote = Number(comment.user_vote || 0);
      const currentCount = Number(comment.likes_count || 0);

      let nextCount = currentCount;
      if (previousVote === 1 && nextVoteType !== 1) {
        nextCount -= 1;
      } else if (previousVote !== 1 && nextVoteType === 1) {
        nextCount += 1;
      }

      return {
        ...comment,
        user_vote: nextVoteType,
        likes_count: Math.max(0, nextCount),
      };
    }

    if (Array.isArray(comment.replies) && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentVoteTree(
          comment.replies,
          targetCommentId,
          nextVoteType,
        ),
      };
    }

    return comment;
  });
};

export const useDiscussions = (filters = {}) => {
  return useQuery({
    queryKey: ["discussions", filters],
    queryFn: ({ signal }) => getDiscussions(filters, signal),
    staleTime: 2 * 60 * 1000,
  });
};

export const useDiscussionTags = () => {
  return useQuery({
    queryKey: ["discussion-tags"],
    queryFn: () => getTags(),
    staleTime: 30 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: ["discussion", discussionId] });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
  });
};

export const useDeleteDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discussionId) => deleteDiscussion(discussionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || "Failed to archive post");
    },
  });
};

export const useHardDeleteDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discussionId) => hardDeleteDiscussion(discussionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    },
  });
};

export const useDeleteComment = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussion", discussionId] });
    },
  });
};

export const useBoostDiscussion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (discussionId) => boostDiscussion(discussionId),
    onSuccess: (data, discussionId) => {
      toast.success(data?.message || "Discussion boosted!");
      queryClient.invalidateQueries({ queryKey: ["discussion", discussionId] });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["trending-discussions"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to boost discussion",
      );
    },
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
    staleTime: 5 * 60 * 1000,
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
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate(`/portal/discussions/${data.discussion_id}`);
    },
  });
};

export const useAddComment = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, parentId, website }) =>
      addComment(discussionId, content, parentId, website),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussion", discussionId] });
    },
  });
};

export const useVote = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (voteType) => voteDiscussion(discussionId, voteType),
    onSuccess: (response) => {
      const nextVoteType = Number(response?.voteType ?? 0);

      queryClient.setQueriesData(
        { queryKey: ["discussion", discussionId] },
        (currentData) => {
          if (!currentData?.discussion) return currentData;

          return {
            ...currentData,
            discussion: updateDiscussionVote(
              currentData.discussion,
              nextVoteType,
            ),
          };
        },
      );

      queryClient.setQueriesData(
        { queryKey: ["discussions"] },
        (currentData) => {
          if (Array.isArray(currentData)) {
            return currentData.map((discussion) =>
              String(discussion.discussion_id) === String(discussionId)
                ? updateDiscussionVote(discussion, nextVoteType)
                : discussion,
            );
          }

          if (
            currentData?.discussions &&
            Array.isArray(currentData.discussions)
          ) {
            return {
              ...currentData,
              discussions: currentData.discussions.map((discussion) =>
                String(discussion.discussion_id) === String(discussionId)
                  ? updateDiscussionVote(discussion, nextVoteType)
                  : discussion,
              ),
            };
          }

          return currentData;
        },
      );

    },
  });
};

export const useCommentVote = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, voteType }) => voteComment(commentId, voteType),
    onSuccess: (response, variables) => {
      const nextVoteType = Number(response?.voteType ?? 0);

      queryClient.setQueriesData(
        { queryKey: ["discussion", discussionId] },
        (currentData) => {
          if (!currentData?.comments) return currentData;

          return {
            ...currentData,
            comments: updateCommentVoteTree(
              currentData.comments,
              variables.commentId,
              nextVoteType,
            ),
          };
        },
      );

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
      queryClient.invalidateQueries({ queryKey: ["discussion", discussionId] });
      queryClient.invalidateQueries({ queryKey: ["discussions"] });
      queryClient.invalidateQueries({ queryKey: ["saved-discussions"] });
    },
  });
};
