import { useQuery } from "@tanstack/react-query";
import { getRoadmaps } from "../services/roadmap";

export const useRoadmaps = (filters = {}) => {
  return useQuery({
    queryKey: ["roadmaps", filters],
    queryFn: () => getRoadmaps(filters),
    staleTime: 5 * 60 * 1000,
  });
};
