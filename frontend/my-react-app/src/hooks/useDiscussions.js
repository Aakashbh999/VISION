import { useQuery } from "@tanstack/react-query";
import { getDiscussions } from "../services/discussion";

export const useDiscussions = (filters = {}) => {
  return useQuery({
    queryKey: ["discussions", filters],
    queryFn: () => getDiscussions(filters),
    staleTime: 2 * 60 * 1000,
  });
};
