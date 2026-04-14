import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

const fetchSystemTags = async () => {
  const response = await api.get("/discussions/tags", {
    params: { type: "system" },
  });
  return Array.isArray(response.data) ? response.data : [];
};

export const useSystemTags = (enabled = true) => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["system-tags"],
    queryFn: fetchSystemTags,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    systemTagOptions: data || [],
    isLoadingTags: enabled ? isLoading || isFetching : false,
  };
};
