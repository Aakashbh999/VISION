import { useQuery } from "@tanstack/react-query";
import { getItFields } from "../services/public";

export const useItFields = (page = 1, limit = 9) => {
  return useQuery({
    queryKey: ["itFields", page, limit],
    queryFn: () => getItFields(page, limit),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};
