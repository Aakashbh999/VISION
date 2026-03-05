import { useQuery } from "@tanstack/react-query";
import { getTags, getUserDefaults } from "../services/discussion";

export const useDiscussionTags = () => {
  return useQuery({
    queryKey: ["discussion-tags"],
    queryFn: () => getTags(),
    staleTime: 30 * 60 * 1000, // 30 minutes - tags don't change often
  });
};

export const useUserFilterDefaults = () => {
  return useQuery({
    queryKey: ["user-filter-defaults"],
    queryFn: () => getUserDefaults(),
    staleTime: 10 * 60 * 1000,
  });
};
