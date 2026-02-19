import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinClub } from "../services/club";

export const useJoinClub = (clubId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => joinClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries(["club", clubId]);
      queryClient.invalidateQueries(["clubs"]);
    },
  });
};
