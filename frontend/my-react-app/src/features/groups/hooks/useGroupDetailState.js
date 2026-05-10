import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  useGroup,
  useGroupPosts,
  useGroupMembers,
  useCreatePost,
  useGroupPostPolling,
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
  const [resourceFile, setResourceFile] = useState(null);
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editingAnswerText, setEditingAnswerText] = useState("");
  const [activeSection, setActiveSection] = useState("general");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  const deletePostMut = useMutation({
    mutationFn: ({ postId, reason }) => groupService.softDeleteGroupPost(postId, reason),
    onSuccess: () => {
      showToast.success("Post deleted");
      refetchPosts();
    },
    onError: (error) =>
      showToast.error(error.response?.data?.error || "Delete failed"),
  });

  const editQaAnswerMut = useMutation({
    mutationFn: ({ postId, content }) => groupService.updateGroupQaAnswer(postId, content),
    onSuccess: () => {
      showToast.success("Answer updated");
      setEditingAnswerId(null);
      setEditingAnswerText("");
      refetchPosts();
    },
    onError: (error) =>
      showToast.error(error.response?.data?.error || "Update failed"),
  });

  // Handle delta polling
  useGroupPostPolling(isMember ? id : null, activeSection);

  const feedPosts = useMemo(() => {
    if (!postsData?.pages) return [];
    let items = postsData.pages
      .flatMap((page) => page?.messages || [])
      .filter((message) => message != null && message.post_id != null);

    if (activeSection === "discussion" || activeSection === "general") {
      return items.slice().reverse();
    }

    if (activeSection === "qa") {
      const questions = items.filter((post) => post.qa_post_type === "question");
      const answersByQuestionId = new Map(
        items
          .filter((post) => post.qa_post_type === "answer" && post.qa_question_post_id)
          .map((answer) => [Number(answer.qa_question_post_id), answer]),
      );

      return questions.map((question) => ({
        ...question,
        answer: answersByQuestionId.get(Number(question.post_id)) || null,
      }));
    }

    return items;
  }, [postsData, activeSection]);

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
    if (!isMember) return;
    
    // Prevent fast double-clicks on mobile from submitting multiple times
    if (createPostMutation.isPending) return;

    if (activeSection === "notice_board" && !canPostNotice) {
      showToast.error("You do not have notice board permission.");
      return;
    }
    
    if (activeSection === "resources" && !isAdmin) {
      showToast.error("Only group admins and moderators can upload resources.");
      return;
    }

    if (activeSection !== "resources" && !newPost.trim()) {
      return;
    }
    if (activeSection === "resources" && !resourceFile) {
      showToast.error("Please select an image/file up to 5MB.");
      return;
    }

    createPostMutation.mutate(
      {
        content: newPost,
        section: activeSection,
        file: activeSection === "resources" ? resourceFile : null,
      },
      {
        onSuccess: () => {
          setNewPost("");
          setResourceFile(null);
          refetchPosts();
          if (activeSection === "discussion" || activeSection === "general") {
            requestAnimationFrame(() => scrollToBottom("smooth"));
          }
        },
      },
    );
  };

  const handleQaAnswerCreate = (questionPostId) => {
    const content = (answerDrafts[questionPostId] || "").trim();
    if (!content) return;

    createPostMutation.mutate(
      {
        content,
        section: "qa",
        qa_post_type: "answer",
        qa_question_post_id: questionPostId,
      },
      {
        onSuccess: () => {
          setAnswerDrafts((prev) => ({ ...prev, [questionPostId]: "" }));
          refetchPosts();
        },
      },
    );
  };

  const handleStartEditAnswer = (answerPostId, currentContent) => {
    setEditingAnswerId(answerPostId);
    setEditingAnswerText(currentContent || "");
  };

  const handleSaveEditedAnswer = () => {
    if (!editingAnswerId || !editingAnswerText.trim()) return;
    editQaAnswerMut.mutate({
      postId: editingAnswerId,
      content: editingAnswerText.trim(),
    });
  };

  const handleJoinAction = () => {
    if (group?.privacy_type === "request") {
      requestJoinMut.mutate();
      return;
    }

    joinGroupMut.mutate();
  };

  useEffect(() => {
    if (isMember && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [id, isMember]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    isInitialLoad.current = true;
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
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
    resourceFile,
    setResourceFile,
    answerDrafts,
    setAnswerDrafts,
    editingAnswerId,
    setEditingAnswerId,
    editingAnswerText,
    setEditingAnswerText,
    activeSection,
    showAdminPanel,
    setShowAdminPanel,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
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
    deletePostMut,
    editQaAnswerMut,
    handlePostSubmit,
    handleQaAnswerCreate,
    handleStartEditAnswer,
    handleSaveEditedAnswer,
    handleJoinAction,
    handleSectionChange,
  };
};
