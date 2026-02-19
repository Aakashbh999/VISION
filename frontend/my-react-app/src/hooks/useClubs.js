import { useQuery } from "@tanstack/react-query";
import { getClubs } from "../services/club";

export const useClubs = (filters = {}) => {
  return useQuery({
    queryKey: ["clubs", filters],
    queryFn: () => getClubs(filters),
    staleTime: 5 * 60 * 1000,
  });
};
