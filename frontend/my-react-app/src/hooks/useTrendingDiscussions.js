import { useQuery } from "@tanstack/react-query";
import { getTrendingDiscussions } from "../services/discussion";

export const useTrendingDiscussions = (limit = 10) => {
  return useQuery({
    queryKey: ["trending-discussions", limit],
    queryFn: () => getTrendingDiscussions(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
