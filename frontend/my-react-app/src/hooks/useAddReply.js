import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addComment } from "../services/discussion";

// Renamed from useAddReply to useAddComment
export const useAddComment = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) => addComment(discussionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", discussionId]);
    },
  });
};

// Keep old name for backwards compatibility
export const useAddReply = useAddComment;
