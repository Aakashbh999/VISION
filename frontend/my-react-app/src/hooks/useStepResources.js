import { useQuery } from "@tanstack/react-query";
import { getStepResources } from "../services/roadmap";

export const useStepResources = (stepId) => {
  return useQuery({
    queryKey: ["stepResources", stepId],
    queryFn: () => getStepResources(stepId),
    enabled: !!stepId,
    staleTime: 5 * 60 * 1000,
  });
};
