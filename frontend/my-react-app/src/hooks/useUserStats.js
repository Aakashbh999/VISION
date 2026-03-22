import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const useUserStats = () => {
  return useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/users/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return data;
    },
    // Keep data fresh
    refetchInterval: 30000, 
    staleTime: 10000,
  });
};
