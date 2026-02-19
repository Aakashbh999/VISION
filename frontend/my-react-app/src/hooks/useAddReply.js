import { useMutation, useQueryClient } from "@tanstack/react-query";
import { replyToDiscussion } from "../services/discussion";

export const useAddReply = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) => replyToDiscussion(discussionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", discussionId]);
    },
  });
};
