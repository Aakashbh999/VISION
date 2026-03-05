import { useQuery } from "@tanstack/react-query";
import { getMyPosts } from "../services/discussion";

export const useMyPosts = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["my-posts", page, limit],
    queryFn: () => getMyPosts(page, limit),
    staleTime: 2 * 60 * 1000,
  });
};
