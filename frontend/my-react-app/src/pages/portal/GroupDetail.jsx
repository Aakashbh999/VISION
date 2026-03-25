import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGroup, useGroupPosts, useGroupMembers, useCreatePost } from "../../hooks/useGroupHooks";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as groupService from "../../services/group";
import { showToast } from "../../utils/toast";


import Button from "../../components/ui/Button";
import Avatar from "../../components/ui/Avatar";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import {
  Send,
  ChevronLeft,
  Users,
  Search,
  ShieldCheck,
  Folder,
  Circle,
  MoreVertical,
  Type,
  Code,
  Megaphone,
  MessagesSquare,
  HelpCircle,
  Box,
  Compass,
  ArrowUpRight,
  MessageCircle,
  Share2,
  Lock,
  UserPlus,
  Check,
  X,
  Settings,
  Star,
  Image as ImageIcon,
  Loader2,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  {
    id: "notice_board",
    label: "Notice Board",
    icon: Megaphone,
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    id: "general",
    label: "General Chat",
    icon: MessagesSquare,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    id: "qa",
    label: "Q&A Node",
    icon: HelpCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    id: "resources",
    label: "Resource Vault",
    icon: Box,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
];

const CO_ADMIN_PERMISSION_OPTIONS = [
  {
    key: "manage_users",
    label: "User Manager",
  },
  {
    key: "moderate_content",
    label: "Content Moderator",
  },
  {
    key: "edit_profile",
    label: "Official Profile",
  },
  {
    key: "post_notice",
    label: "Official Voice",
  },
];

const GroupDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [newPost, setNewPost] = useState("");
  const [activeSection, setActiveSection] = useState("general");
  const [messageSearch, setMessageSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const isInitialLoad = useRef(true);

  // Additional state for Admin Panel
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

  // Join Requests Query
  const { data: joinRequests } = useQuery({
    queryKey: ["groupJoinRequests", id],
    queryFn: () => groupService.getJoinRequests(id),
    enabled: Boolean(group?.can_manage_users || group?.is_owner),
  });

  const isOwner = group?.is_owner;
  const isCoAdmin = group?.is_co_admin;
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

  // Mutations
  const appointCoAdminMut = useMutation({
    mutationFn: (memberId) => groupService.appointCoAdmin(id, memberId),
    onSuccess: () => {
      showToast.success("Co-Admin appointed");
      refetchMembers();
    },
  });

  const removeCoAdminMut = useMutation({
    mutationFn: (memberId) => groupService.removeCoAdmin(id, memberId),
    onSuccess: () => {
      showToast.success("Co-Admin removed");
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
    onError: (err) =>
      showToast.error(err.response?.data?.error || "Permission update failed"),
  });

  const approveRequestMut = useMutation({
    mutationFn: (reqId) => groupService.approveJoinRequest(id, reqId),
    onSuccess: () => {
      showToast.success("Request approved");
      queryClient.invalidateQueries({ queryKey: ["groupJoinRequests", id] });
      refetchMembers();
      refetchGroup(); // Capacity goes down potentially
    },
    onError: (err) =>
      showToast.error(err.response?.data?.error || "Approval failed"),
  });

  const declineRequestMut = useMutation({
    mutationFn: (reqId) => groupService.declineJoinRequest(id, reqId),
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
    onError: (err) =>
      showToast.error(err.response?.data?.error || "Failed to expand"),
  });

  const requestJoinMut = useMutation({
    mutationFn: () => groupService.requestToJoin(id),
    onSuccess: () => {
      showToast.success("Join request submitted!");
      refetchGroup();
    },
    onError: (err) =>
      showToast.error(err.response?.data?.error || "Request failed"),
  });

  const joinGroupMut = useMutation({
    mutationFn: () => groupService.joinGroup(id),
    onSuccess: () => {
      showToast.success("Joined group!");
      refetchGroup();
      refetchMembers();
    },
    onError: (err) =>
      showToast.error(err.response?.data?.error || "Join failed"),
  });

  // Polling
  useEffect(() => {
    if (!isMember) return;
    const pollInterval = setInterval(() => refetchPosts(), 30000);
    return () => clearInterval(pollInterval);
  }, [refetchPosts, isMember]);

  // Auto-scroll logic removed pinnedResources fetch as it was unused

  const feedPosts = useMemo(() => {
    if (!postsData?.pages) return [];
    let items = postsData.pages
      .flatMap((page) => page?.messages || [])
      .filter((msg) => msg != null && msg.post_id != null);

    if (activeSection === "discussion" || activeSection === "general") {
      return items.slice().reverse();
    }
    if (messageSearch) {
      items = items.filter(
        (m) =>
          m.content.toLowerCase().includes(messageSearch.toLowerCase()) ||
          m.full_name?.toLowerCase().includes(messageSearch.toLowerCase()),
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

  const handlePostSubmit = (e) => {
    e.preventDefault();
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
    if (group.privacy_type === "request") {
      requestJoinMut.mutate();
    } else {
      joinGroupMut.mutate();
    }
  };

  if (groupLoading)
    return (
      <div className="h-[calc(100vh-64px)] flex flex-col bg-[var(--bg-main)]/50 p-6 space-y-8 animate-pulse">
        <div className="flex items-center gap-6">
          <Skeleton
            variant="rectangular"
            width={48}
            height={48}
            className="rounded-2xl"
          />
          <div className="space-y-2">
            <Skeleton width={200} height={24} />
            <Skeleton width={100} height={12} />
          </div>
        </div>
      </div>
    );

  if (groupError || !group)
    return (
      <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] font-black uppercase tracking-widest gap-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100">
          <ShieldCheck className="w-10 h-10 text-rose-500" />
        </div>
        Node Connection Failed
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Re-initialize
        </Button>
      </div>
    );

  // Private View Filter
  if (!isMember && group.privacy_type === "private") {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-[var(--bg-main)]">
        <div className="max-w-md w-full p-8 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-[2.5rem] shadow-xl text-center">
          <div className="w-20 h-20 bg-[var(--bg-active)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[var(--text-muted)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">
            Private Directory
          </h2>
          <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
            This sector is restricted. You need a verified invite link from the
            Labyrinth Master to access these files.
          </p>
          <Link to="/groups">
            <Button variant="outline" className="w-full">
              Return to Public Sector
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col -m-4 md:-m-6 lg:-m-8 bg-[var(--bg-main)]/50 overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-card)] relative">
          {/* Header */}
          <div className="h-20 px-4 md:px-8 flex items-center justify-between border-b border-[var(--border-main)]/50 sticky top-0 z-20 backdrop-blur-xl bg-[var(--bg-main)]/80">
            <div className="flex items-center gap-4">
              <Link to="/groups">
                <Button variant="ghost" size="sm" className="p-2.5">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                {/* Group avatar — click to go to group permalink */}
                <Link
                  to={`/groups/${id}/profile`}
                  className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center shadow-lg hover:ring-2 hover:ring-purple-500 hover:ring-offset-1 transition-all"
                >
                  {group.group_image ? (
                    <img
                      src={group.group_image}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (() => {
                      const CurrentIcon =
                        SECTIONS.find((s) => s.id === activeSection)?.icon ||
                        Compass;
                      return (
                        <CurrentIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      );
                    })()
                  )}
                </Link>
                <div className="flex flex-col min-w-0">
                  <h1 className="font-black text-[var(--text-main)] text-sm sm:text-base md:text-lg leading-tight flex items-center gap-2 sm:gap-3 truncate">
                    <span className="truncate">{group.name}</span>
                    <Badge
                      color={
                        SECTIONS.find((s) => s.id === activeSection)
                          ?.color.replace("text-", "")
                          .split("-")[0] || "purple"
                      }
                      className="hidden md:inline-flex shrink-0"
                    >
                      {SECTIONS.find((s) => s.id === activeSection)?.label}
                    </Badge>
                  </h1>
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate">
                    {group.members} Members • Capacity: {group.capacity}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-[var(--border-main)] pl-4">
              {!isMember ? (
                group.has_pending_request ? (
                  <Button variant="outline" disabled size="sm">
                    Request Pending
                  </Button>
                ) : (
                  <Button
                    variant="shiny"
                    size="sm"
                    onClick={handleJoinAction}
                    isLoading={
                      joinGroupMut.isPending || requestJoinMut.isPending
                    }
                    className="gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {group.privacy_type === "request"
                      ? "Request to Join"
                      : "Join Sector"}
                  </Button>
                )
              ) : (
                isAdmin && (
                  <Button
                    variant={showAdminPanel ? "shiny" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setShowAdminPanel(!showAdminPanel);
                      setIsSidebarOpen(true);
                    }}
                    className="p-2.5 gap-1.5 md:gap-2 flex"
                  >
                    <Settings className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-[10px] md:text-xs font-bold hidden sm:inline">Admin Panel</span>
                  </Button>
                )
              )}
              <Button
                variant={showSearch ? "shiny" : "ghost"}
                size="sm"
                className="p-2.5 flex"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="p-2.5 lg:hidden ml-1"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 py-3 border-b border-[var(--border-main)] bg-[var(--bg-main)] overflow-hidden"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Search protocol..."
                    value={messageSearch}
                    onChange={(e) => setMessageSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 text-[var(--text-main)]"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feed Area */}
          <div
            ref={messagesContainerRef}
            className={`flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth ${
              activeSection === "discussion" || activeSection === "general"
                ? "bg-[var(--bg-main)]"
                : "bg-[var(--bg-main)]/30"
            }`}
          >
            {!isMember ? (
              <div className="py-20 flex flex-col items-center justify-center opacity-60">
                <div className="w-20 h-20 rounded-full bg-[var(--bg-active)] flex items-center justify-center mb-6">
                  <Lock className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
                <p className="font-bold text-[var(--text-muted)] text-sm">
                  You must join this group to view the network archives.
                </p>
              </div>
            ) : (
              <>
                {/* Publisher */}
                {activeSection !== "discussion" &&
                  activeSection !== "general" && (
                    <div className="mb-8 max-w-4xl mx-auto">
                      {activeSection !== "notice_board" || isAdmin ? (
                        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-4xl p-5 shadow-sm group">
                          <div className="flex gap-4">
                            <Avatar
                              src={user?.profile_image}
                              name={user?.full_name}
                              size="md"
                            />
                            <div className="flex-1">
                              <textarea
                                rows="2"
                                placeholder="Initialize data sequence..."
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                className="w-full bg-[var(--bg-active)] p-4 border border-[var(--border-main)] rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all placeholder:text-[var(--text-muted)] text-[var(--text-main)]"
                              />
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex gap-2 text-[var(--text-muted)]">
                                  <Type className="w-4 h-4 hover:text-purple-600 cursor-pointer" />
                                  <Code className="w-4 h-4 hover:text-purple-600 cursor-pointer" />
                                </div>
                                <Button
                                  size="sm"
                                  onClick={handlePostSubmit}
                                  isLoading={createPostMutation.isPending}
                                  disabled={!newPost.trim()}
                                >
                                  Publish
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[var(--bg-active)] border border-[var(--border-main)] rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                          <Megaphone className="w-8 h-8 text-[var(--text-muted)] mb-3" />
                          <Badge color="rose">Read-Only Notice Board</Badge>
                        </div>
                      )}
                    </div>
                  )}

                {isFetchingNextPage && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-purple-600 w-6 h-6" />
                  </div>
                )}

                <div className="max-w-4xl mx-auto space-y-6">
                  {feedPosts.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center opacity-30 text-center">
                      <MessagesSquare className="w-12 h-12 text-[var(--text-muted)] mb-4" />
                      <p className="font-black uppercase tracking-[0.2em] text-[var(--text-muted)] text-xs">
                        Awaiting Transmissions
                      </p>
                    </div>
                  ) : (
                    feedPosts.map((post) => {
                      const isMe =
                        String(post.user_id) === String(user?.portal_user_id);

                      if (
                        activeSection === "discussion" ||
                        activeSection === "general"
                      ) {
                        return (
                          <div
                            key={post.post_id}
                            className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                          >
                            <Avatar
                              src={post.profile_image}
                              name={post.full_name}
                              size="xs"
                              className="mt-1"
                            />
                            <div
                              className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}
                            >
                              <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">
                                  {new Date(post.created_at).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] font-black tracking-wider">
                                  {isMe ? "You" : post.full_name}
                                </span>
                              </div>
                              <div
                                className={`px-4 py-2.5 rounded-[1.25rem] text-sm font-medium ${
                                  isMe
                                    ? "bg-purple-600 text-white rounded-tr-none"
                                    : "bg-[var(--bg-active)] text-[var(--text-main)] border-[var(--border-main)] rounded-tl-none border"
                                }`}
                              >
                                {post.content}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={post.post_id}
                          className="bg-[var(--bg-card)] border border-[var(--border-main)] p-6 rounded-3xl shadow-sm hover:border-purple-200 transition-colors"
                        >
                          <div className="flex gap-4">
                            <Avatar
                              src={post.profile_image}
                              name={post.full_name}
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              <header className="flex items-center justify-between mb-3">
                                <div className="flex gap-2 items-center">
                                  <span className="font-bold text-[var(--text-main)] leading-none">
                                    {post.full_name}
                                  </span>
                                  {post.user_id === group.created_by && (
                                    <Badge
                                      color="purple"
                                      size="sm"
                                      className="hidden sm:block"
                                    >
                                      Master
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[10px] text-[var(--text-muted)] font-bold">
                                  {new Date(
                                    post.created_at,
                                  ).toLocaleDateString()}
                                </span>
                              </header>
                              <div className="text-[var(--text-muted)] text-sm whitespace-pre-wrap leading-relaxed">
                                {post.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div ref={messagesEndRef} className="h-4" />
              </>
            )}
          </div>

          {/* Chat Input */}
          {isMember &&
            (activeSection === "discussion" || activeSection === "general") && (
              <div className="p-4 md:p-6 bg-[var(--bg-card)] border-t border-[var(--border-main)]">
                <form
                  onSubmit={handlePostSubmit}
                  className="max-w-4xl mx-auto flex items-center gap-3"
                >
                  <div className="flex-1 bg-[var(--bg-active)] rounded-2xl flex items-center px-4 py-3 border border-[var(--border-main)] focus-within:ring-2 focus-within:ring-purple-200">
                    <input
                      type="text"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent border-none text-sm font-medium focus:outline-none placeholder:text-[var(--text-muted)] text-[var(--text-main)]"
                    />
                  </div>
                  <Button
                    variant="shiny"
                    size="md"
                    type="submit"
                    disabled={!newPost.trim() || createPostMutation.isPending}
                    className="w-12 h-12 p-0 rounded-2xl flex items-center justify-center"
                  >
                    <Send className="w-4 h-4 translate-x-0.5 -translate-y-0.5" />
                  </Button>
                </form>
              </div>
            )}
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Right Sidebar */}
        <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-[var(--bg-card)] border-l border-[var(--border-main)] border-y md:border-y-0 transform transition-transform duration-300 ease-in-out lg:static lg:transform-none lg:flex flex-col flex ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          {/* Close button for mobile */}
          <div className="lg:hidden absolute top-4 right-4 z-50">
            <Button variant="ghost" size="sm" className="p-2 bg-[var(--bg-main)]/50 backdrop-blur" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          {showAdminPanel && isAdmin ? (
            // ------------------ ADMIN PANEL ------------------
            <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)]/50">
              <header className="px-6 py-5 border-b border-[var(--border-main)] bg-[var(--bg-card)]">
                <h2 className="font-black text-[var(--text-main)] tracking-tight flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600" /> Server
                  Administration
                </h2>
              </header>
              <div className="p-6 space-y-8 overflow-y-auto">
                {/* Capacity Management */}
                <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-main)] shadow-sm">
                  <h3 className="text-xs font-black uppercase text-[var(--text-muted)] mb-4 tracking-wider">
                    Capacity Matrix
                  </h3>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-[var(--text-main)]">
                      {group.members} / {group.capacity} Slots
                    </span>
                    <Badge
                      color={
                        group.members >= group.capacity ? "rose" : "emerald"
                      }
                    >
                      {group.members >= group.capacity ? "Full" : "Available"}
                    </Badge>
                  </div>
                  <div className="w-full bg-[var(--bg-active)] h-2 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full ${group.members >= group.capacity ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{
                        width: `${Math.min(100, (group.members / group.capacity) * 100)}%`,
                      }}
                    />
                  </div>
                  {isOwner && group.capacity < 25 && (
                    <Button
                      variant="outline"
                      className="w-full text-xs font-bold dashed border-[var(--border-main)] gap-2"
                      onClick={() => expandCapacityMut.mutate()}
                      isLoading={expandCapacityMut.isPending}
                      title="Costs 100 VXP"
                    >
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />{" "}
                      Expand Capacity (+2)
                    </Button>
                  )}
                </div>

                {/* Join Requests Queue */}
                {canManageUsers && (
                  <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-main)] shadow-sm">
                    <h3 className="text-xs font-black uppercase text-[var(--text-muted)] mb-4 tracking-wider flex items-center justify-between">
                      Approval Queue
                      {joinRequests?.length > 0 && (
                        <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-[10px]">
                          {joinRequests.length}
                        </span>
                      )}
                    </h3>
                    {joinRequests?.length > 0 ? (
                      <div className="space-y-3">
                        {joinRequests.map((req) => (
                          <div
                            key={req.request_id}
                            className="flex flex-col gap-2 p-3 bg-[var(--bg-active)] rounded-xl border border-[var(--border-main)]"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={req.profile_image}
                                name={req.full_name}
                                size="sm"
                              />
                              <span className="text-sm font-bold truncate flex-1 text-[var(--text-main)]">
                                {req.full_name}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                                onClick={() =>
                                  approveRequestMut.mutate(req.request_id)
                                }
                              >
                                <Check className="w-4 h-4" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-rose-500 hover:bg-rose-50 border-rose-200"
                                onClick={() =>
                                  declineRequestMut.mutate(req.request_id)
                                }
                              >
                                <X className="w-4 h-4" /> Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)] font-bold text-center py-4">
                        Queue is empty
                      </p>
                    )}
                  </div>
                )}

                {/* Co-Admin Role Management */}
                {isOwner && (
                  <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-main)] shadow-sm">
                    <h3 className="text-xs font-black uppercase text-[var(--text-muted)] mb-4 tracking-wider">
                      Council of Five Roles
                    </h3>
                    <div className="space-y-2">
                      {members
                        ?.filter(
                          (m) =>
                            String(m.user_id) !== String(user?.portal_user_id),
                        )
                        .map((m) => (
                          <div
                            key={m.user_id}
                            className="p-3 hover:bg-[var(--bg-active)] rounded-lg group border border-[var(--border-main)]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={m.profile_image}
                                  name={m.full_name}
                                  size="sm"
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-[var(--text-main)] truncate max-w-25">
                                    {m.full_name}
                                  </span>
                                  {m.role === "co_admin" && (
                                    <span className="text-[10px] text-purple-600 font-semibold">
                                      Co-Admin
                                    </span>
                                  )}
                                </div>
                              </div>
                              {m.role === "member" ? (
                                <button
                                  onClick={() =>
                                    appointCoAdminMut.mutate(m.user_id)
                                  }
                                  className="text-[10px] font-bold text-[var(--text-muted)] hover:text-purple-600 px-2 py-1 rounded bg-[var(--bg-active)] hover:bg-purple-50 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  Promote
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    removeCoAdminMut.mutate(m.user_id)
                                  }
                                  className="text-[10px] font-bold text-rose-500 hover:text-rose-700 px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 transition-colors"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                            {m.role === "co_admin" && (
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                {CO_ADMIN_PERMISSION_OPTIONS.map(
                                  (permission) => {
                                    const isEnabled = Boolean(
                                      m.permissions?.[permission.key],
                                    );

                                    return (
                                      <button
                                        key={permission.key}
                                        type="button"
                                        onClick={() =>
                                          updatePermissionMut.mutate({
                                            memberId: m.user_id,
                                            permissions: {
                                              [permission.key]: !isEnabled,
                                            },
                                          })
                                        }
                                        disabled={updatePermissionMut.isPending}
                                        className={`text-[10px] font-bold px-2.5 py-2 rounded-lg border transition-colors ${
                                          isEnabled
                                            ? "bg-purple-50 border-purple-200 text-purple-700"
                                            : "bg-[var(--bg-active)] border-[var(--border-main)] text-[var(--text-muted)]"
                                        } disabled:opacity-60`}
                                      >
                                        {permission.label}
                                      </button>
                                    );
                                  },
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // ------------------ STANDARD REGISTRY PANEL ------------------
            <>
              <header className="h-20 px-8 flex items-center justify-between border-b border-[var(--border-main)] bg-[var(--bg-card)] shadow-sm z-10">
                <span className="text-xs font-black text-[var(--text-main)] uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" /> Registry
                </span>
                <Badge variant="soft" color="slate">
                  {members?.length || 0}
                </Badge>
              </header>

              {/* Group identity card at top of sidebar */}
              <Link
                to={`/groups/${id}/profile`}
                className="flex items-center gap-3 mx-4 mt-4 mb-2 p-3 rounded-2xl border border-[var(--border-main)] hover:border-purple-200 hover:bg-purple-50/50 transition-all group/glink"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover/glink:ring-2 group-hover/glink:ring-purple-400 transition-all">
                  {group.group_image ? (
                    <img
                      src={group.group_image}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-black text-sm">
                      {group.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-[var(--text-main)] truncate group-hover/glink:text-purple-700 transition-colors">
                    {group.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                    View Group Profile
                  </span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] ml-auto group-hover/glink:text-purple-500 transition-colors shrink-0" />
              </Link>

              <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
                {/* Sectors */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-2">
                    Sectors
                  </label>
                  <div className="grid gap-2">
                    {SECTIONS.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => {
                            setActiveSection(section.id);
                            isInitialLoad.current = true;
                            setIsSidebarOpen(false); // Close sidebar on mobile after selection
                          }}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                            isActive
                              ? "bg-slate-900 border-slate-900"
                              : "bg-[var(--bg-card)] border hover:bg-[var(--bg-active)]"
                          } border-[var(--border-main)]`}
                        >
                          <div
                            className={`p-2 rounded-lg ${isActive ? "bg-white/10" : section.bg}`}
                          >
                            <Icon
                              className={`w-4 h-4 ${isActive ? "text-white" : section.color}`}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-black uppercase tracking-wider ${
                              isActive ? "text-white" : "text-[var(--text-main)]"
                            }`}
                          >
                            {section.label}
                          </span>
                          {isActive && (
                            <Circle className="w-2 h-2 fill-white ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest px-2">
                    Collaborators
                  </label>
                  <div className="grid gap-1">
                    {members?.map((m) => (
                      <Link
                        to={`/profile/${m.user_id}`}
                        key={m.user_id}
                        className="flex items-center gap-3 p-2 hover:bg-[var(--bg-active)] rounded-xl transition-all border border-transparent hover:border-[var(--border-main)]"
                      >
                        <Avatar
                          src={m.profile_image}
                          name={m.full_name}
                          size="md"
                          variant="circular"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-[var(--text-main)] truncate">
                            {String(m.user_id) === String(user?.portal_user_id)
                              ? "You"
                              : m.full_name}
                          </span>
                          {m.role !== "member" && (
                            <span
                              className={`text-[10px] uppercase font-black tracking-widest ${
                                m.role === "owner"
                                  ? "text-purple-600"
                                  : "text-blue-500"
                              }`}
                            >
                              {m.role === "owner" ? "Master" : "Co-Admin"}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;