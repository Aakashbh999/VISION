import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useUserStats = () => {
  return useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      const { data } = await api.get("/users/stats");
      return data;
    },

    refetchInterval: 30000,
    staleTime: 10000,
  });
};
