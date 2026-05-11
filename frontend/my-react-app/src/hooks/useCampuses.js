import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const fetchCampuses = async () => {
  const response = await api.get("/campuses");
  return response.data;
};

export const useCampuses = () => {
  return useQuery({
    queryKey: ["campuses"],
    queryFn: fetchCampuses,
    staleTime: 10 * 60 * 1000,
  });
};
