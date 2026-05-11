import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoadmapStatus, leaveRoadmap, lockRoadmap } from "../services/roadmap";
import { toast } from "react-toastify";

export const useRoadmapStatus = (id) => {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["roadmap-status", id],
    queryFn: () => getRoadmapStatus(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveRoadmap(id),
    onSuccess: (data) => {
      toast.success(data.message || "You have left the roadmap.");
      queryClient.invalidateQueries({ queryKey: ["roadmap-status", id] });
      queryClient.invalidateQueries({ queryKey: ["roadmap-path", id] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
    onError: (error) => {
      console.error("[leaveRoadmap Error]", error);
      toast.error(error.response?.data?.message || "Failed to leave roadmap.");
    },
  });

  const lockMutation = useMutation({
    mutationFn: () => lockRoadmap(id),
    onSuccess: (data) => {
      toast.success(data.message || "Roadmap locked.");
      queryClient.invalidateQueries({ queryKey: ["roadmap-status", id] });
      queryClient.invalidateQueries({ queryKey: ["roadmap-path", id] });
      queryClient.invalidateQueries({ queryKey: ["roadmap", id] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
    onError: (error) => {
      console.error("[lockRoadmap Error]", error);
      toast.error(error.response?.data?.message || "Failed to lock roadmap.");
    },
  });

  return {
    status: statusQuery.data?.enrolment || null,
    isLoading: statusQuery.isLoading,
    isError: statusQuery.isError,
    leaveRoadmap: leaveMutation.mutate,
    isLeaving: leaveMutation.isPending,
    lockRoadmap: lockMutation.mutate,
    isLocking: lockMutation.isPending,
  };
};
