import { useQuery } from "@tanstack/react-query";
import { getGroupPosts } from "../services/group";

export const useGroupPosts = (groupId) => {
  return useQuery({
    queryKey: ["groupPosts", groupId],
    queryFn: () => getGroupPosts(groupId),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
  });
};
