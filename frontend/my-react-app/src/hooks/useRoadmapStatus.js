import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoadmapStatus, leaveRoadmap } from "../services/roadmap";
import { toast } from "react-toastify";

export const useRoadmapStatus = (id) => {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["roadmap-status", id],
    queryFn: () => getRoadmapStatus(id),
    enabled: !!id,
    staleTime: 1000 * 60, // 1 minute
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveRoadmap(id),
    onSuccess: (data) => {
      toast.success(data.message || "You have left the roadmap.");
      // Invalidate both status and path to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["roadmap-status", id] });
      queryClient.invalidateQueries({ queryKey: ["roadmap-path", id] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to leave roadmap.");
    },
  });

  return {
    status: statusQuery.data?.enrolment || null,
    isLoading: statusQuery.isLoading,
    isError: statusQuery.isError,
    leaveRoadmap: leaveMutation.mutate,
    isLeaving: leaveMutation.isPending,
  };
};
