import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveClub } from "../services/club";

export const useLeaveClub = (clubId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries(["club", clubId]);
      queryClient.invalidateQueries(["clubs"]);
    },
  });
};
