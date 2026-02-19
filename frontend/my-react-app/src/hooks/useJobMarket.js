import { useQuery } from "@tanstack/react-query";
import { getJobMarket } from "../services/public";

export const useJobMarket = (page = 1, limit = 9) => {
  return useQuery({
    queryKey: ["jobMarket", page, limit],
    queryFn: () => getJobMarket(page, limit),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};
