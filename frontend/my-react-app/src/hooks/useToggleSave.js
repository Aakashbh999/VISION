import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleSave } from "../services/discussion";

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
