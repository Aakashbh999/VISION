import { useQuery } from "@tanstack/react-query";
import { getGroups } from "../services/group";

export const useGroups = () => {
  return useQuery({
    queryKey: ["groups"],
    queryFn: getGroups,
    staleTime: 5 * 60 * 1000,
  });
};
