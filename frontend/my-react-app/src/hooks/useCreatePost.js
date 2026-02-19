import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroupPost } from "../services/group";

export const useCreatePost = (groupId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) => createGroupPost(groupId, content),
    onSuccess: () => {
      queryClient.invalidateQueries(["groupPosts", groupId]);
    },
  });
};
