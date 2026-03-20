import { useQuery } from "@tanstack/react-query";
import { getRoadmapPath } from "../services/roadmap";

export const useRoadmapPath = (id) => {
  return useQuery({
    queryKey: ["roadmap-path", id],
    queryFn: () => getRoadmapPath(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
