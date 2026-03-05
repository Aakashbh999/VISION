import { useQuery } from "@tanstack/react-query";
import { getSavedDiscussions } from "../services/discussion";

export const useSavedDiscussions = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["saved-discussions", page, limit],
    queryFn: () => getSavedDiscussions(page, limit),
    staleTime: 2 * 60 * 1000,
  });
};
