import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike } from "../services/discussion";

export const useToggleLike = (discussionId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleLike(discussionId),
    onSuccess: () => {
      queryClient.invalidateQueries(["discussion", discussionId]);
      queryClient.invalidateQueries(["discussions"]);
    },
  });
};
