import { useQuery } from "@tanstack/react-query";
import { getGroup } from "../services/group";

export const useGroup = (id) => {
  return useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
