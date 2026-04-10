import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingResources,
  approveResource,
  rejectResource,
} from "../services/moderator";
import { toast } from "react-toastify";

export const usePendingResources = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["pending-resources", page, limit],
    queryFn: () => getPendingResources(page, limit),
  });
};

export const useApproveResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => approveResource(id),
    onSuccess: (data) => {
      toast.success(data?.message || "Resource approved.");
      queryClient.invalidateQueries({ queryKey: ["pending-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] }); // Invalidate public resources list
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to approve resource.",
      );
    },
  });
};

export const useRejectResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => rejectResource(id, reason),
    onSuccess: (data) => {
      toast.success(data?.message || "Resource rejected.");
      queryClient.invalidateQueries({ queryKey: ["pending-resources"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to reject resource.",
      );
    },
  });
};
