import { useQuery } from "@tanstack/react-query";
import { getItClubs } from "../services/public";

export const useItClubs = (page = 1, limit = 9) => {
  return useQuery({
    queryKey: ["itClubs", page, limit], // page must be here
    queryFn: () => getItClubs(page, limit),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};
