import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  useGroup,
  useGroupPosts,
  useGroupMembers,
  useCreatePost,
} from "../../../hooks/useGroupHooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as groupService from "../../../services/group";
import { showToast } from "../../../utils/toast";

export const useGroupDetailState = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const isInitialLoad = useRef(true);

  const [newPost, setNewPost] = useState("");
  const [activeSection, setActiveSection] = useState("general");
  const [messageSearch, setMessageSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
    refetch: refetchGroup,
  } = useGroup(id);

  const {
    data: postsData,
    isFetchingNextPage,
    refetch: refetchPosts,
  } = useGroupPosts(id, activeSection);

  const { data: members, refetch: refetchMembers } = useGroupMembers(id);
  const createPostMutation = useCreatePost(id);

  const { data: joinRequests } = useQuery({
    queryKey: ["groupJoinRequests", id],
    queryFn: () => groupService.getJoinRequests(id),
    enabled: Boolean(group?.can_manage_users || group?.is_owner),
  });

  const isOwner = group?.is_owner;
  const canManageUsers = Boolean(group?.can_manage_users || isOwner);
  const canPostNotice = Boolean(group?.can_post_notice || isOwner);
  const isAdmin = Boolean(
    isOwner ||
    group?.can_manage_users ||
    group?.can_moderate_content ||
    group?.can_edit_profile ||
    group?.can_post_notice,
  );
  const isMember = group?.is_member;

  const appointCoAdminMut = useMutation({
    mutationFn: (memberId) => groupService.appointCoAdmin(id, memberId),
    onSuccess: () => {
      showToast.success("Moderator appointed");
      refetchMembers();
    },
  });

  const removeCoAdminMut = useMutation({
    mutationFn: (memberId) => groupService.removeCoAdmin(id, memberId),
    onSuccess: () => {
      showToast.success("Moderator removed");
      refetchMembers();
    },
  });

  const updatePermissionMut = useMutation({
    mutationFn: ({ memberId, permissions }) =>
      groupService.updateCoAdminPermissions(id, memberId, permissions),
    onSuccess: () => {
      showToast.success("Permissions updated");
      refetchMembers();
      refetchGroup();
    },
    onError: (error) =>
      showToast.error(
        error.response?.data?.error || "Permission update failed",
      ),
  });

  const approveRequestMut = useMutation({
    mutationFn: (requestId) => groupService.approveJoinRequest(id, requestId),
    onSuccess: () => {
      showToast.success("Request approved");
      queryClient.invalidateQueries({ queryKey: ["groupJoinRequests", id] });
      refetchMembers();
      refetchGroup();
    },
    onError: (error) =>
      showToast.error(error.response?.data?.error || "Approval failed"),
  });

  const declineRequestMut = useMutation({
    mutationFn: (requestId) => groupService.declineJoinRequest(id, requestId),
    onSuccess: () => {
      showToast.success("Request declined");
      queryClient.invalidateQueries({ queryKey: ["groupJoinRequests", id] });
    },
  });

  const expandCapacityMut = useMutation({
    mutationFn: () => groupService.expandCapacity(id),
    onSuccess: (data) => {
      showToast.success(`Capacity expanded to ${data.capacity}`);
      refetchGroup();
    },
    onError: (error) =>
      showToast.error(error.response?.data?.error || "Failed to expand"),
  });

  const requestJoinMut = useMutation({
    mutationFn: () => groupService.requestToJoin(id),
    onSuccess: () => {
      showToast.success("Join request submitted!");
      refetchGroup();
    },
    onError: (error) =>
      showToast.error(error.response?.data?.error || "Request failed"),
  });

  const joinGroupMut = useMutation({
    mutationFn: () => groupService.joinGroup(id),
    onSuccess: () => {
      showToast.success("Joined group!");
      refetchGroup();
      refetchMembers();
    },
    onError: (error) =>
      showToast.error(error.response?.data?.error || "Join failed"),
  });

  useEffect(() => {
    if (!isMember) return;
    const pollInterval = setInterval(() => refetchPosts(), 30000);
    return () => clearInterval(pollInterval);
  }, [refetchPosts, isMember]);

  const feedPosts = useMemo(() => {
    if (!postsData?.pages) return [];
    let items = postsData.pages
      .flatMap((page) => page?.messages || [])
      .filter((message) => message != null && message.post_id != null);

    if (activeSection === "discussion" || activeSection === "general") {
      return items.slice().reverse();
    }

    if (messageSearch) {
      items = items.filter(
        (message) =>
          message.content.toLowerCase().includes(messageSearch.toLowerCase()) ||
          message.full_name
            ?.toLowerCase()
            .includes(messageSearch.toLowerCase()),
      );
    }

    return items;
  }, [postsData, messageSearch, activeSection]);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (activeSection !== "discussion" && activeSection !== "general") return;

    const container = messagesContainerRef.current;
    if (!container || feedPosts.length === 0) return;

    const threshold = 150;
    const isNearBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + threshold;

    if (isInitialLoad.current) {
      scrollToBottom("instant");
      isInitialLoad.current = false;
    } else if (isNearBottom) {
      scrollToBottom("smooth");
    }
  }, [feedPosts.length, scrollToBottom, activeSection]);

  const handlePostSubmit = (event) => {
    event.preventDefault();
    if (!newPost.trim() || !isMember) return;

    if (activeSection === "notice_board" && !canPostNotice) {
      showToast.error("You do not have notice board permission.");
      return;
    }

    createPostMutation.mutate(
      { content: newPost, section: activeSection },
      {
        onSuccess: () => {
          setNewPost("");
          refetchPosts();
          if (activeSection === "discussion" || activeSection === "general") {
            requestAnimationFrame(() => scrollToBottom("smooth"));
          }
        },
      },
    );
  };

  const handleJoinAction = () => {
    if (group?.privacy_type === "request") {
      requestJoinMut.mutate();
      return;
    }

    joinGroupMut.mutate();
  };

  useEffect(() => {
    if (isMember) {
      setIsSidebarOpen(true);
    }
  }, [id, isMember]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    isInitialLoad.current = true;
    setIsSidebarOpen(false);
  };

  return {
    id,
    user,
    group,
    groupLoading,
    groupError,
    members,
    joinRequests,
    feedPosts,
    isOwner,
    canManageUsers,
    canPostNotice,
    isAdmin,
    isMember,
    isFetchingNextPage,
    newPost,
    setNewPost,
    activeSection,
    messageSearch,
    setMessageSearch,
    showSearch,
    setShowSearch,
    showAdminPanel,
    setShowAdminPanel,
    isSidebarOpen,
    setIsSidebarOpen,
    messagesEndRef,
    messagesContainerRef,
    appointCoAdminMut,
    removeCoAdminMut,
    updatePermissionMut,
    approveRequestMut,
    declineRequestMut,
    expandCapacityMut,
    requestJoinMut,
    joinGroupMut,
    createPostMutation,
    handlePostSubmit,
    handleJoinAction,
    handleSectionChange,
  };
};
