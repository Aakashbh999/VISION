import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinGroup } from "../services/group";

export const useJoinGroup = (groupId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries(["groups"]);
      queryClient.invalidateQueries(["group", groupId]);
    },
  });
};
