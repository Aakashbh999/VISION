import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeStep } from "../services/roadmap";

export const useCompleteStep = (roadmapId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeStep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }); // if dashboard shows progress
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
