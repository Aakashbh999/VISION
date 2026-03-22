import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClub, getClubs, joinClub, leaveClub } from "../services/club";
import { getItClubs } from "../services/public";

export const useClub = (slug) => {
  return useQuery({
    queryKey: ["club", slug],
    queryFn: () => getClub(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useClubs = (filters = {}) => {
  return useQuery({
    queryKey: ["clubs", filters],
    queryFn: async () => {
      const response = await getClubs(filters);
      return response.clubs;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useJoinClub = (clubId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => joinClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries(["club", clubId]);
      queryClient.invalidateQueries(["clubs"]);
    },
  });
};

export const useLeaveClub = (clubId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveClub(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries(["club", clubId]);
      queryClient.invalidateQueries(["clubs"]);
    },
  });
};

export const useItClubs = (page = 1, limit = 9) => {
  return useQuery({
    queryKey: ["itClubs", page, limit],
    queryFn: () => getItClubs(page, limit),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });
};
