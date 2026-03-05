import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateDiscussion,
  deleteDiscussion,
  deleteComment,
} from "../services/discussion";

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
