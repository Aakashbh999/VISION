import { useQuery } from "@tanstack/react-query";
import { getDiscussion } from "../services/discussion";

export const useDiscussion = (id) => {
  return useQuery({
    queryKey: ["discussion", id],
    queryFn: () => getDiscussion(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};
