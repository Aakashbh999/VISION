import { useQuery } from "@tanstack/react-query";
import { getAcademicDegrees } from "../services/public";

export const useAcademicDegrees = (page = 1, limit = 9) => {
  return useQuery({
    queryKey: ["academicDegrees", page, limit],
    queryFn: () => getAcademicDegrees(page, limit),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};
