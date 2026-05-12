import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../services/dashboard";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    staleTime: 5 * 60 * 1000,
  });
};
