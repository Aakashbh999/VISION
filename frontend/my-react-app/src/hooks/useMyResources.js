import { useQuery } from "@tanstack/react-query";
import { getMyResources } from "../services/resource";

export const useMyResources = () => {
  return useQuery({
    queryKey: ["my-resources"],
    queryFn: () => getMyResources(),
    staleTime: 2 * 60 * 1000,
  });
};
