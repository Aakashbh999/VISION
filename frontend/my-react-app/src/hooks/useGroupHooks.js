import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
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
    queryKey: [
      "groups",
      filters.search || "",
      filters.sort || "latest",
      filters.degree || "",
      filters.program || "",
    ],
    queryFn: () => getGroups(filters),
    staleTime: 0,
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
  });
};

export const useGroupMembers = (groupId) => {
  return useQuery({
    queryKey: ["groupMembers", groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export const useGroupPosts = (groupId, section = "general") => {
  return useInfiniteQuery({
    queryKey: ["groupPosts", groupId, section],
    queryFn: ({ pageParam }) =>
      getGroupPosts(groupId, { limit: 20, before: pageParam, section }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.oldestId : undefined,
    enabled: !!groupId,
    staleTime: 10 * 1000,

  });
};

export const useGroupPostPolling = (groupId, section = "general") => {
  const queryClient = useQueryClient();

  useQuery({
    queryKey: ["groupPostsPolling", groupId, section],
    queryFn: async () => {

      const queryState = queryClient.getQueryState(["groupPosts", groupId, section]);
      if (queryState?.fetchStatus === "fetching") return null;

      const cachedData = queryClient.getQueryData(["groupPosts", groupId, section]);
      if (!cachedData || !cachedData.pages || cachedData.pages.length === 0) return null;

      let latestId = null;
      for (const page of cachedData.pages) {
        if (page.messages && page.messages.length > 0) {
          const pageNewestId = Math.max(...page.messages.map(m => m.post_id || 0));
          if (pageNewestId > (latestId || 0)) {
            latestId = pageNewestId;
          }
        }
      }

      if (!latestId) return null;

      const deltaData = await getGroupPosts(groupId, { after: latestId, section });
      if (deltaData && deltaData.messages && deltaData.messages.length > 0) {

        queryClient.setQueryData(["groupPosts", groupId, section], (oldData) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;

          const newPages = [...oldData.pages];

          const newRealMessages = deltaData.messages;
          const currentFirstPageMessages = newPages[0].messages.filter(msg => {

            if (msg.post_id > 0) return true;

            return false;
          });

          newPages[0] = {
            ...newPages[0],
            messages: [...newRealMessages, ...currentFirstPageMessages],
            latestId: deltaData.latestId || newPages[0].latestId
          };

          return { ...oldData, pages: newPages };
        });
      }
      return deltaData;
    },
    enabled: !!groupId,
    refetchInterval: () => (document.hidden ? 60000 : 5000),
    refetchIntervalInBackground: true,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      navigate(`/portal/groups/${data.group_id}`);
    },
  });
};

export const useJoinGroup = (groupId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
};

export const useLeaveGroup = (groupId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export const useCreatePost = (groupId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createGroupPost(groupId, payload),
    onMutate: async (payload) => {
      const section = payload?.section || "general";
      const queryKey = ["groupPosts", groupId, section];

      await queryClient.cancelQueries({ queryKey });
      const previousPosts = queryClient.getQueryData(queryKey);

      const user = queryClient.getQueryData(["auth-user"]);

      if (previousPosts) {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) return oldData;

          const newPages = [...oldData.pages];

          const currentUserId = user?.portal_user_id ?? user?.user_id ?? user?.id;
          const optimisticPost = {
            post_id: -Date.now(),
            user_id: currentUserId,
            full_name: user?.full_name || "You",
            profile_image: user?.profile_image,
            content: payload.content,
            section: section,
            created_at: new Date().toISOString(),
            is_deleted: false,
          };

          newPages[0] = {
            ...newPages[0],
            messages: [optimisticPost, ...newPages[0].messages]
          };

          return { ...oldData, pages: newPages };
        });
      }
      return { previousPosts, queryKey };
    },
    onError: (err, newPost, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(context.queryKey, context.previousPosts);
      }
    },
    onSettled: (data, error, variables, context) => {

      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
};
