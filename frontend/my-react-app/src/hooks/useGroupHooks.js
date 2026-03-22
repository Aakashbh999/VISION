import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getGroup,
  getGroups,
  getGroupMembers,
  getGroupPosts,
  createGroup,
  joinGroup,
  leaveGroup,
  createGroupPost,
} from "../services/group";

export const useGroup = (id) => {
  return useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroup(id),
    enabled: !!id,
    refetchOnMount: "always",
    staleTime: 5 * 60 * 1000,
  });
};

export const useGroups = (filters = {}) => {
  return useQuery({
    queryKey: ["groups", filters],
    queryFn: () => getGroups(filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useGroupMembers = (groupId) => {
  return useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useGroupPosts = (groupId, section = 'general') => {
  return useInfiniteQuery({
    queryKey: ["groupPosts", groupId, section],
    queryFn: ({ pageParam }) =>
      getGroupPosts(groupId, { limit: 20, before: pageParam, section }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.oldestId : undefined,
    enabled: !!groupId,
    staleTime: 10 * 1000,
    refetchInterval: 20 * 1000,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['groups']);
      navigate(`/portal/groups/${data.group_id}`);
    },
  });
};

export const useJoinGroup = (groupId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries(["groups"]);
      queryClient.invalidateQueries(["group", groupId]);
      queryClient.invalidateQueries(["groupMembers", groupId]);
    },
  });
};

export const useLeaveGroup = (groupId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries(["group", groupId]);
      queryClient.invalidateQueries(["groupMembers", groupId]);
      queryClient.invalidateQueries(["groups"]);
    },
  });
};

export const useCreatePost = (groupId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ content, section }) => createGroupPost(groupId, content, section),
    onSuccess: () => {
      // Invalidate both the general and specific section queries
      queryClient.invalidateQueries({ queryKey: ["groupPosts", groupId] });
    },
  });
};
