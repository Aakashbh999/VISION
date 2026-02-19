import { useQuery } from "@tanstack/react-query";
import { getFeed } from "../services/feed";

export const useFeed = (limit = 10) => {
  return useQuery({
    queryKey: ["feed", limit],
    queryFn: () => getFeed(limit),
    staleTime: 2 * 60 * 1000,
  });
};
