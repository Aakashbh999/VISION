import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeStep } from "../services/roadmap";

export const useCompleteStep = (roadmapId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeStep,
    onSuccess: () => {
      queryClient.invalidateQueries(["roadmap", roadmapId]);
      queryClient.invalidateQueries(["dashboard"]); // if dashboard shows progress
    },
  });
};
