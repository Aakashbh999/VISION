import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeStep } from "../services/roadmap";

export const useCompleteStep = (roadmapId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, data }) => completeStep(stepId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roadmap", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmap-path", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmap-status", roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
};
