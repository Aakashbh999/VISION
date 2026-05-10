import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useGroup, useGroupMembers } from "../../../hooks/useGroupHooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as groupService from "../../../services/group";
import { showToast } from "../../../utils/toast";
import DeleteAction from "../../../components/DeleteAction";
import VisionImageEditor from "../../../components/VisionImageEditor";
import ActionMenu from "../../../components/ui/ActionMenu";
import Avatar from "../../../components/ui/Avatar";
import {
  Users,
  Camera,
  Edit2,
  Check,
  X,
  ChevronLeft,
  MessageSquare,
  Calendar,
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  UserCheck,
  ArrowUpRight,
  Info,
  GraduationCap,
  UserPlus,
  Loader2,
  Trash2,
  PencilLine,
  LogOut,
  MoreHorizontal,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

// ─────────────────────────────────────────────
//  Permission levels
//    owner    → can edit everything
//    co_admin → Moderator — can edit description
//    member   → read-only member
//    viewer   → not a member, read-only
// ─────────────────────────────────────────────

const ROLE_CONFIG = {
  owner: {
    label: "Admin",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  co_admin: {
    label: "Moderator",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  member: {
    label: "Member",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

const PRIVACY_CONFIG = {
  public: { label: "Public", icon: Globe, color: "text-emerald-600" },
  request: { label: "Request to Join", icon: Shield, color: "text-amber-600" },
  private: { label: "Private", icon: Lock, color: "text-rose-600" },
};

const MAX_GROUP_DESCRIPTION_WORDS = 130;

const countWords = (text = "") =>
  text.trim().split(/\s+/).filter(Boolean).length;

export default function GroupProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: group,
    isLoading: groupLoading,
    error: groupError,
  } = useGroup(id);
  const { data: members } = useGroupMembers(id);

  // Derive permission level
  const isOwner = group?.is_owner;
  const isCoAdmin = group?.is_co_admin;
  const canEditDescription = Boolean(group?.can_edit_profile || isOwner);
  const canEditImages = Boolean(group?.can_edit_profile || isOwner);

  // Local edit state
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftGroup, setDraftGroup] = useState({ name: "", description: "" });
  const [memberSearch, setMemberSearch] = useState("");
  const [visibleMembersCount, setVisibleMembersCount] = useState(5);

  // Which image editor is open: null | 'avatar' | 'banner'
  const [activeEditor, setActiveEditor] = useState(null);

  const handleEditStart = () => {
    setDraftGroup({
      name: group?.name || "",
      description: group?.description || "",
    });
    setIsEditMode(true);
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
    setActiveEditor(null);
  };

  const handleSaveChanges = () => {
    if (!draftGroup.name.trim()) {
      showToast.error("Group name required.");
      return;
    }
    if (countWords(draftGroup.description) > MAX_GROUP_DESCRIPTION_WORDS) {
      showToast.error(
        `Description cannot exceed ${MAX_GROUP_DESCRIPTION_WORDS} words.`,
      );
      return;
    }
    updateGroupMut.mutate({
      name: draftGroup.name.trim(),
      description: draftGroup.description,
    });
    setIsEditMode(false);
  };

  // ── Mutations ───────────────────────────────
  const updateGroupMut = useMutation({
    mutationFn: (data) => groupService.updateGroup(id, data),
    onSuccess: () => {
      showToast.success("Group updated");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (err) =>
      showToast.error(err.response?.data?.error || "Update failed"),
  });

  const updateImageMut = useMutation({
    mutationFn: (formData) => groupService.updateGroupImage(id, formData),
    onSuccess: () => {
      showToast.success("Group image updated");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (err) =>
      showToast.error(err.response?.data?.error || "Image update failed"),
  });

  const updateBannerMut = useMutation({
    mutationFn: (formData) => groupService.updateGroupBanner(id, formData),
    onSuccess: () => {
      showToast.success("Banner updated");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (err) =>
      showToast.error(err.response?.data?.error || "Banner update failed"),
  });

  const joinGroupMut = useMutation({
    mutationFn: () =>
      group?.privacy_type === "request"
        ? groupService.requestToJoin(id)
        : groupService.joinGroup(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
    },
    onError: (err) =>
      showToast.error(err.response?.data?.error || "Action failed"),
  });

  const leaveGroupMut = useMutation({
    mutationFn: () => groupService.leaveGroup(id),
    onSuccess: () => {
      showToast.success("Left the circle");
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      navigate("/groups");
    },
    onError: (err) =>
      showToast.error(err.response?.data?.error || "Failed to leave circle"),
  });

  // ── File handlers ───────────────────────────
  const handleAvatarDone = (formData) => {
    formData.append("use_skip", "true");
    updateImageMut.mutate(formData, { onSettled: () => setActiveEditor(null) });
  };

  const handleBannerDone = (formData) => {
    formData.append("use_skip", "true");
    updateBannerMut.mutate(formData, {
      onSettled: () => setActiveEditor(null),
    });
  };

  // ── Loading / Error states ──────────────────
  if (groupLoading) {
    return <LoadingSpinner label="Accessing circle workspace..." className="min-h-screen" />;
  }

  if (groupError || !group) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-rose-400" />
        Group not found or access denied.
      </div>
    );
  }

  const privacyCfg =
    PRIVACY_CONFIG[group.privacy_type] || PRIVACY_CONFIG.public;
  const PrivacyIcon = privacyCfg.icon;

  const normalizedMemberSearch = memberSearch.trim().toLowerCase();
  const filteredMembers = (members || []).filter((member) =>
    (member.full_name || "").toLowerCase().includes(normalizedMemberSearch),
  );
  const visibleMembers = filteredMembers.slice(0, visibleMembersCount);
  const hasMoreMembers = filteredMembers.length > visibleMembersCount;
  const canShowMoreMembers = filteredMembers.length > 5 && hasMoreMembers;
  const canHideMembers =
    filteredMembers.length > 5 && !hasMoreMembers && visibleMembersCount > 5;
  const useFixedMembersViewport = (members || []).length > 5;

  return (
    <div className="px-2 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)] hover:text-purple-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-[var(--text-muted)]/30">/</span>
        <Link
          to={`/groups/${id}`}
          className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-muted)] hover:text-purple-600 transition-colors"
        >
          Open Workspace <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Hero Card ───────────────────────── */}
      <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm overflow-hidden relative">
        {/* Banner */}
        <div className="h-52 relative bg-gradient-to-r from-slate-900 to-purple-900 overflow-hidden">
          {group.banner_image && (
            <img
              src={group.banner_image}
              alt="Group Banner"
              className="w-full h-full object-cover opacity-80"
            />
          )}
          {!group.banner_image && (
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(at_top_right,rgba(124,58,237,0.8),transparent_50%),radial-gradient(at_bottom_left,rgba(59,130,246,0.8),transparent_50%)]" />
          )}
          {/* Three dots menu for edit */}
          {canEditDescription && (
            <div className="absolute top-4 right-4 z-20">
              <ActionMenu
                align="right"
                trigger={<MoreHorizontal className="w-5 h-5 text-white" />}
                className="rounded-xl bg-black/35 backdrop-blur-sm border border-white/15"
                actions={[
                  {
                    label: "Edit Profile",
                    icon: <PencilLine className="w-4 h-4" />,
                    onClick: handleEditStart,
                  },
                ]}
              />
            </div>
          )}
          {canEditImages && isEditMode && (
            <div className="absolute top-4 right-16">
              {activeEditor === "banner" ? (
                <VisionImageEditor
                  aspect={16 / 9}
                  onDone={handleBannerDone}
                  onCancel={() => setActiveEditor(null)}
                  isLoading={updateBannerMut.isPending}
                />
              ) : (
                <button
                  onClick={() => setActiveEditor("banner")}
                  disabled={updateBannerMut.isPending}
                  className="bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg backdrop-blur-sm text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  {updateBannerMut.isPending ? "Uploading..." : "Change Banner"}
                </button>
              )}
            </div>
          )}
          {/* Save/Cancel buttons in edit mode */}
          {canEditDescription && isEditMode && (
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <button
                type="button"
                onClick={handleEditCancel}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--bg-active)] text-[var(--text-main)] font-bold hover:bg-[var(--border-main)] transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={updateGroupMut.isPending}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all disabled:opacity-60"
              >
                {updateGroupMut.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Info row */}
        <div className="px-4 sm:px-6 pb-5 sm:pb-6 lg:px-10 pt-2 sm:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 -mt-10 sm:-mt-14">
            {/* Avatar */}
            <div className="relative group/av">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-sm sm:rounded-2xl border-4 border-[var(--bg-card)] shadow-xl flex items-center justify-center bg-slate-900 overflow-hidden">
                {group.group_image ? (
                  <img
                    src={group.group_image}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-black text-white">
                    {group.name?.charAt(0)?.toUpperCase() || "G"}
                  </span>
                )}
              </div>
              {canEditImages &&
                isEditMode &&
                (activeEditor === "avatar" ? (
                  <VisionImageEditor
                    aspect={1}
                    onDone={handleAvatarDone}
                    onCancel={() => setActiveEditor(null)}
                    isLoading={updateImageMut.isPending}
                    asModal
                  />
                ) : (
                  <button
                    onClick={() => setActiveEditor("avatar")}
                    disabled={updateImageMut.isPending}
                    className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition-opacity"
                  >
                    {updateImageMut.isPending ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </button>
                ))}
            </div>
            {/* Name + meta */}
            <div className="flex-1 pb-2 sm:pb-4 space-y-1">
              {/* Editable name */}
              {canEditDescription && isEditMode ? (
                <div className="space-y-2 mb-3">
                  <label className="block text-xs font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                    Group Name
                  </label>
                  <input
                    value={draftGroup.name}
                    onChange={(e) =>
                      setDraftGroup({ ...draftGroup, name: e.target.value })
                    }
                    className="text-2xl sm:text-3xl font-black text-[var(--text-main)] border-b-2 border-purple-400 bg-transparent focus:outline-none w-full"
                    maxLength={150}
                  />
                </div>
              ) : (
                <h1 className="text-xl sm:text-3xl font-black text-[var(--text-main)] flex items-center gap-3 leading-tight">
                  {group.name}
                </h1>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
                {/* Privacy badge */}
                <span
                  className={`flex items-center gap-1.5 font-semibold ${privacyCfg.color}`}
                >
                  <PrivacyIcon className="w-3.5 h-3.5" /> {privacyCfg.label}
                </span>
                {group.degree_name && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[var(--text-muted)]" />{" "}
                    {group.degree_name}
                  </span>
                )}
              </div>

              {/* Viewer's own role badge */}
              {group.member_role &&
                ROLE_CONFIG[group.member_role] &&
                (() => {
                  const cfg = ROLE_CONFIG[group.member_role];
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${cfg.color}`}
                    >
                      {cfg.label}
                    </span>
                  );
                })()}
            </div>

            {/* Action buttons */}
            <div className="pb-2 sm:pb-4 flex gap-2 sm:gap-3 flex-wrap">
              {!group.is_member &&
                (group.has_pending_request ? (
                  <button
                    disabled
                    className="px-4 sm:px-5 py-2 rounded-xl font-bold bg-[var(--bg-active)] text-[var(--text-muted)] cursor-not-allowed"
                  >
                    Request Pending
                  </button>
                ) : (
                  <button
                    onClick={() => joinGroupMut.mutate()}
                    disabled={joinGroupMut.isPending}
                    className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20 disabled:opacity-60"
                  >
                    {joinGroupMut.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {group.privacy_type === "request"
                      ? "Request to Join"
                      : "Join Group"}
                  </button>
                ))}
              <Link
                to={`/groups/${id}`}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold bg-[var(--bg-active)] text-[var(--text-main)] hover:bg-[var(--border-main)] transition-colors"
              >
                <MessageSquare className="w-4 h-4" /> Open Workspace
              </Link>

              {group.is_member && !isOwner && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to leave this circle?",
                      )
                    ) {
                      leaveGroupMut.mutate();
                    }
                  }}
                  disabled={leaveGroupMut.isPending}
                  className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-100 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" /> Leave Circle
                </button>
              )}


            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-4 sm:gap-6 text-sm border-t border-[var(--border-main)] pt-4 sm:pt-6">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Users className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="font-black text-[var(--text-main)]">
                {group.members || 0}
              </span>{" "}
              / {group.capacity} Members
            </div>
            <div className="flex items-center gap-2 text-[var(--text-muted)] border-l pl-4 sm:pl-6 border-[var(--border-main)]">
              <MessageSquare className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="font-black text-[var(--text-main)]">
                {group.post_count || 0}
              </span>{" "}
              Posts
            </div>
            <div className="flex items-center gap-2 text-[var(--text-muted)] border-l pl-4 sm:pl-6 border-[var(--border-main)]">
              <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
              Founded{" "}
              <span className="font-black text-[var(--text-main)]">
                {new Date(group.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {group.last_activity && (
              <div className="flex items-center gap-2 text-[var(--text-muted)] border-l pl-4 sm:pl-6 border-[var(--border-main)]">
                Last active{" "}
                <span className="font-black text-[var(--text-main)]">
                  {new Date(group.last_activity).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column body ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left — Description + Creator */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Description */}
          <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm p-5 sm:p-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" /> About this Circle
              </h3>
              {canEditDescription && isEditMode && (
                <span className="text-xs font-bold uppercase tracking-[0.24em] text-purple-600">
                  Editing
                </span>
              )}
            </div>

            {canEditDescription && isEditMode ? (
              <div className="space-y-3">
                <textarea
                  value={draftGroup.description}
                  onChange={(e) =>
                    setDraftGroup({
                      ...draftGroup,
                      description: e.target.value,
                    })
                  }
                  maxLength={1000}
                  className="w-full text-sm text-[var(--text-main)] bg-[var(--bg-active)] border border-[var(--border-main)] rounded-xl p-4 focus:ring-2 focus:ring-purple-600 focus:border-transparent min-h-30"
                  placeholder="Describe what this circle is about..."
                />
                <p
                  className={`text-xs text-right ${countWords(draftGroup.description) > MAX_GROUP_DESCRIPTION_WORDS ? "text-red-600" : "text-[var(--text-muted)]"}`}
                >
                  {countWords(draftGroup.description)}/
                  {MAX_GROUP_DESCRIPTION_WORDS} words
                </p>
              </div>
            ) : (
              <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">
                {group.description ||
                  "This circle hasn't added a description yet."}
              </p>
            )}
          </div>

          {/* Creator card */}
          <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm p-5 sm:p-8">
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)] mb-4 sm:mb-6">
              Admin
            </h3>
            <Link
              to={`/profile/${group.creator_id}`}
              className="flex items-center gap-4 group/creator"
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-active)] overflow-hidden shrink-0 border-2 border-white shadow-md">
                {group.creator_image ? (
                  <img
                    src={group.creator_image}
                    alt={group.creator}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg sm:text-xl font-black text-[var(--text-muted)]">
                    {group.creator?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-black text-[var(--text-main)] group-hover/creator:text-purple-600 transition-colors flex items-center gap-2">
                  {group.creator}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover/creator:opacity-100 transition-opacity" />
                </p>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">
                  Group Founder
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right — Members preview + Edit settings (owner) */}
        <div className="space-y-6 sm:space-y-8">
          {/* Moderator roles + members preview */}
          <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-2xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm p-4 sm:p-6">
            <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-wider mb-5 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" /> Members
            </h3>

            <div className="mb-4">
              <input
                type="text"
                value={memberSearch}
                onChange={(event) => {
                  setMemberSearch(event.target.value);
                  setVisibleMembersCount(5);
                }}
                placeholder="Search members by name"
                className="w-full rounded-lg border border-[var(--border-main)] bg-[var(--bg-active)] px-3 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-purple-300"
              />
            </div>

            <div
              className={`${useFixedMembersViewport ? "h-[320px] overflow-y-auto" : ""} min-h-[220px] pr-1`}
            >
              {visibleMembers.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">
                  {memberSearch.trim()
                    ? "No matching members found."
                    : "No members yet."}
                </p>
              ) : (
                <div className="space-y-3">
                  {visibleMembers.map((m) => {
                    const cfg = ROLE_CONFIG[m.role];
                    return (
                      <Link
                        key={m.user_id}
                        to={`/profile/${m.user_id}`}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-active)] transition-colors group/member"
                      >
                        <Avatar
                          src={m.profile_image}
                          name={m.full_name}
                          size="md"
                          variant="circular"
                          status={m.is_online ? "online" : null}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[var(--text-main)] truncate group-hover/member:text-purple-600 transition-colors">
                            {m.full_name}
                          </p>
                          {cfg && (
                            <p
                              className={`text-[10px] font-bold ${cfg.color.split(" ")[1]}`}
                            >
                              {cfg.label}
                            </p>
                          )}
                          {m.is_online && (
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
                              Online now
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className={`${useFixedMembersViewport ? "mt-4 min-h-[24px]" : "mt-4"} flex items-center justify-center`}
            >
              {canShowMoreMembers && (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleMembersCount((prev) =>
                      prev < 10 ? 10 : prev + 10,
                    )
                  }
                  className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-purple-700 hover:text-purple-800 transition-colors"
                >
                  Show more
                </button>
              )}

              {canHideMembers && (
                <button
                  type="button"
                  onClick={() => setVisibleMembersCount(5)}
                  className="px-1 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Hide
                </button>
              )}
            </div>
          </div>

          {/* Owner-only settings panel */}
          {isOwner && (
            <Motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl shadow-xl p-1 relative overflow-hidden"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white/20">
                <h3 className="text-sm font-black text-purple-100 uppercase tracking-wider mb-4">
                  Admin Controls
                </h3>
                <div className="space-y-2">
                  <Link
                    to={`/groups/${id}`}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors border border-white/10"
                  >
                    Manage Members & Roles <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/groups/${id}`}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors border border-white/10"
                  >
                    Review Join Requests <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/groups/${id}`}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-colors border border-white/10"
                  >
                    Expand Capacity <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <DeleteAction
                    targetType="group"
                    targetId={id}
                    itemName={group?.name}
                    onDeleted={() =>
                      setTimeout(() => navigate("/groups"), 1200)
                    }
                    buttonClassName="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-200 text-sm font-bold transition-colors border border-red-600/40"
                    label={
                      <>
                        Delete Group <Trash2 className="w-4 h-4" />
                      </>
                    }
                  />
                </div>
                <p className="text-[10px] text-purple-200 text-center mt-4 uppercase tracking-widest">
                  You are the Admin
                </p>
              </div>
            </Motion.div>
          )}

          {/* Moderator info panel */}
          {isCoAdmin && !isOwner && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 sm:p-6">
              <h3 className="text-sm font-black text-purple-700 uppercase tracking-wider mb-2">
                Moderators
              </h3>
              <div className="space-y-2">
                {(members || [])
                  .filter((member) => member.role === "co_admin")
                  .map((member) => (
                    <Link
                      key={member.user_id}
                      to={`/profile/${member.user_id}`}
                      className="flex items-center gap-3 rounded-xl bg-white border border-purple-100 px-3 py-2 hover:bg-purple-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-100 overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-black text-purple-700">
                        {member.profile_image ? (
                          <img
                            src={member.profile_image}
                            alt={member.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.full_name?.charAt(0)?.toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-purple-900 truncate">
                          {member.full_name}
                        </p>
                        <p className="text-[11px] text-purple-600 uppercase tracking-wider font-bold">
                          Moderator
                        </p>
                      </div>
                    </Link>
                  ))}

                {(members || []).filter((member) => member.role === "co_admin")
                  .length === 0 && (
                  <p className="text-xs text-purple-600 leading-relaxed">
                    No moderators are assigned yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Removed bottom Save/Cancel bar in edit mode */}
    </div>
  );
}
