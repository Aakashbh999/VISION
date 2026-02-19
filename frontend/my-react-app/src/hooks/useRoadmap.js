import { useQuery } from "@tanstack/react-query";
import { getRoadmap } from "../services/roadmap";

export const useRoadmap = (id) => {
  return useQuery({
    queryKey: ["roadmap", id],
    queryFn: () => getRoadmap(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
