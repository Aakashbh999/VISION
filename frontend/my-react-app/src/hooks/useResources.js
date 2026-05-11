import { useQuery } from "@tanstack/react-query";
import { getResources } from "../services/resource";

export const useResources = (filters = {}) => {
  return useQuery({
    queryKey: ["resources", filters],
    queryFn: ({ signal }) => getResources(filters, signal),
    staleTime: 5 * 60 * 1000,
  });
};
