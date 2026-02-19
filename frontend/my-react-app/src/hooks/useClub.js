import { useQuery } from "@tanstack/react-query";
import { getClub } from "../services/club";

export const useClub = (id) => {
  return useQuery({
    queryKey: ["club", id],
    queryFn: () => getClub(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
