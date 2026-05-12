import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const fetchPrograms = async () => {
  const response = await api.get("/programs");
  return response.data;
};

export const usePrograms = () => {
  return useQuery({
    queryKey: ["programs"],
    queryFn: fetchPrograms,
    staleTime: 10 * 60 * 1000,
  });
};
