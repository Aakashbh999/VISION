import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyResources, softDeleteResource } from "../services/resource";
import { toast } from "react-toastify";

export const useMyResources = () => {
  return useQuery({
    queryKey: ["my-resources"],
    queryFn: () => getMyResources(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useSoftDeleteResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, reason }) =>
      softDeleteResource(resourceId, reason),
    onSuccess: (data) => {
      toast.success(data?.message || "Resource deleted.");
      queryClient.invalidateQueries({ queryKey: ["my-resources"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to delete resource.",
      );
    },
  });
};
