import { useQuery } from "@tanstack/react-query";
import { getStepResources } from "../services/roadmap";

export const useStepResources = (id, stepId) => {
  return useQuery({
    queryKey: ["stepResources", id, stepId],
    queryFn: () => getStepResources(id, stepId),
    enabled: !!id && !!stepId,
    staleTime: 5 * 60 * 1000,
  });
};
