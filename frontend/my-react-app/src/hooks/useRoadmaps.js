import { useQuery } from "@tanstack/react-query";
import { getRoadmaps } from "../services/roadmap";

export const useRoadmaps = () => {
  return useQuery({
    queryKey: ["roadmaps"],
    queryFn: getRoadmaps,
    staleTime: 5 * 60 * 1000,
  });
};
