import {
  Camera,
  Check,
  ChevronDown,
  MoreHorizontal,
  FileText,
  Github,
  Globe,
  Instagram,
  Linkedin,
  MessageSquare,
  PencilLine,
  Twitter,
  UserMinus,
  Users,
  Youtube,
  Facebook,
  MapPin,
  Calendar,
  GraduationCap,
  FolderOpen,
  Plus,
  X,
  School,
} from "lucide-react";
import { Link } from "react-router-dom";
import { RedditIcon } from "../utils/profileHelpers";
import ActionMenu from "../../../components/ui/ActionMenu";
import Button from "../../../components/ui/Button";

const ProfileHeaderCard = ({
  profile,
  isOwner,
  isEditMode,
  followDropdownOpen,
  setFollowDropdownOpen,
  followDropdownRef,
  followMut,
  profileUserId,
  handleFollowToggle,
  handleEditStart,
  setActiveEditor,
  setViewingAvatar,
  draftProfile,
  handleDraftChange,
  programName,
  handleEditCancel,
  handleSaveChanges,
  isSavingProfile,
}) => {
  const socialLinks = [
    {
      key: "linkedin_url",
      icon: Linkedin,
      color: "text-blue-600 hover:bg-blue-600 hover:text-white",
      label: "LinkedIn",
    },
    {
      key: "github_url",
      icon: Github,
      color: "text-slate-900 hover:bg-slate-900 hover:text-white",
      label: "GitHub",
    },
    {
      key: "facebook_url",
      icon: Facebook,
      color: "text-blue-700 hover:bg-blue-700 hover:text-white",
      label: "Facebook",
    },
    {
      key: "instagram_url",
      icon: Instagram,
      color: "text-pink-600 hover:bg-pink-600 hover:text-white",
      label: "Instagram",
    },
    {
      key: "twitter_url",
      icon: Twitter,
      color: "text-sky-500 hover:bg-sky-500 hover:text-white",
      label: "Twitter",
    },
    {
      key: "reddit_url",
      icon: RedditIcon,
      color: "text-orange-600 hover:bg-orange-600 hover:text-white",
      label: "Reddit",
    },
    {
      key: "youtube_url",
      icon: Youtube,
      color: "text-red-600 hover:bg-red-600 hover:text-white",
      label: "YouTube",
    },
    {
      key: "website_url",
      icon: Globe,
      color: "text-teal-600 hover:bg-teal-600 hover:text-white",
      label: "Website",
    },
  ];

  return (
    <div className="bg-(--bg-card) bg-linear-to-br from-purple-50/50 to-transparent dark:from-purple-900/10 dark:to-transparent rounded-sm sm:rounded-3xl border border-(--border-main) border-x-0 sm:border-x shadow-sm overflow-hidden relative">
      <div className="h-56 relative bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden group/banner">
        {profile.banner_image && (
          <img
            src={profile.banner_image}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
        {isOwner && !isEditMode && (
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
                {
                  label: "Manage Account",
                  icon: <FolderOpen className="w-4 h-4" />,
                  href: "/manage",
                },
              ]}
            />
          </div>
        )}
        {isOwner && isEditMode && (
          <>
            {/* Save/Cancel buttons top left */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleEditCancel}
                className="rounded-lg"
              >
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button
                type="button"
                variant="shiny"
                size="sm"
                onClick={handleSaveChanges}
                isLoading={isSavingProfile}
                className="px-5 py-2 rounded-xl"
              >
                <Check className="w-4 h-4" /> Save
              </Button>
            </div>
            {/* Banner upload overlay */}
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setActiveEditor("banner")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 text-sm font-bold shadow-lg"
              >
                <Camera className="w-4 h-4" /> Upload Banner
              </button>
            </div>
          </>
        )}
      </div>

      <div className="px-6 lg:px-8 pb-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 relative z-20">
          {/* Avatar Area */}
          <div className="relative shrink-0 -mt-16 sm:-mt-20 md:-mt-24 mx-auto md:mx-0 group/avatar">
            <div
              onClick={() => {
                if (isOwner && isEditMode) return;
                setViewingAvatar(true);
              }}
              className={`w-32 h-32 sm:w-42 sm:h-42 rounded-full bg-white border-4 border-(--bg-card) shadow-xl flex items-center justify-center bg-linear-to-br from-purple-500 to-blue-500 overflow-hidden relative ${isOwner && !isEditMode ? "cursor-pointer" : ""}`}
            >
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt={profile.full_name}
                  className="w-full h-full object-cover relative z-0"
                />
              ) : (
                <span className="text-5xl sm:text-7xl font-bold text-white">
                  {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}

              {profile.is_online && (
                <span className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex h-4 w-4 sm:h-5 sm:w-5 z-10">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex flex-1 h-full w-full rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                </span>
              )}

              {isOwner && isEditMode && (
                <button
                  type="button"
                  onClick={() => setActiveEditor("avatar")}
                  className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 text-sm font-bold shadow-lg">
                    <Camera className="w-4 h-4" /> Upload
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Info and Buttons Area */}
          <div className="flex-1 flex flex-col md:flex-row justify-between items-center md:items-end gap-5 mt-2 sm:mt-0 pb-4">
            {/* User Info Block */}
            <div className="text-center md:text-left flex-1 min-w-0 w-full">
              {isOwner && isEditMode ? (
                <div className="space-y-3 max-w-xl mx-auto md:mx-0">
                  <label className="block text-xs font-bold uppercase tracking-[0.24em] text-(--text-muted)">
                    Full Name
                  </label>
                  <input
                    value={draftProfile.full_name}
                    onChange={(event) =>
                      handleDraftChange("full_name", event.target.value)
                    }
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-(--border-main) bg-(--bg-active) focus:bg-(--bg-card) backdrop-blur-sm text-xl sm:text-2xl lg:text-3xl font-bold text-(--text-main) focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-(--text-main) flex flex-wrap justify-center md:justify-start items-center gap-3">
                  {profile.full_name}
                  {profile.is_moderator && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold uppercase tracking-wider">
                      Moderator
                    </span>
                  )}
                </h1>
              )}

              {!isEditMode && (
                <p className="font-semibold text-[var(--text-main)] mt-1.5 text-[15px]">
                  {profile.followers_count || 0} followers •{" "}
                  {profile.following_count || 0} following
                </p>
              )}

              {profile.is_online && !isOwner && (
                <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                  Active recently
                </p>
              )}

              <div className="mt-2.5 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-[15px] text-(--text-muted) font-medium">
                {profile.program_name && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" /> {profile.program_name}
                  </span>
                )}
                {profile.batch_year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Batch {profile.batch_year}
                  </span>
                )}
                {profile.university && (
                  <span className="flex items-center gap-1.5">
                    <School className="w-4 h-4 text-(--text-muted)" />{" "}
                    {profile.university}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap justify-center md:justify-start items-center gap-2">
                {socialLinks.map((social) => {
                  const url = profile[social.key];
                  if (!url) return null;
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.label}
                      className={`p-2 rounded-full bg-(--bg-active) border border-(--border-main) shadow-sm transition-colors active:scale-95 ${social.color}`}
                    >
                      <Icon className="w-4 h-4 pointer-events-none" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center md:justify-end items-center gap-3 shrink-0 w-full md:w-auto mt-4 md:mt-0">
              {!isOwner &&
                (profile.is_following ? (
                  <div
                    className="relative w-full sm:w-auto"
                    ref={followDropdownRef}
                  >
                    <Button
                      variant="secondary"
                      onClick={() => setFollowDropdownOpen((open) => !open)}
                      isLoading={followMut.isPending}
                      className="w-full sm:w-auto bg-[#e4e6eb] dark:bg-[#3a3b3c] text-slate-900 dark:text-gray-100 hover:bg-[#d8dadf] dark:hover:bg-[#4e4f50] text-[15px]"
                    >
                      <Check className="w-4 h-4" />
                      Following
                      <ChevronDown
                        className={`w-4 h-4 ml-0.5 transition-transform ${followDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </Button>
                    {followDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-full sm:w-40 bg-(--bg-card) rounded-xl shadow-lg border border-(--border-main) py-1 z-50">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setFollowDropdownOpen(false);
                            if (!profileUserId) return;
                            followMut.mutate({
                              userId: profileUserId,
                              isFollowing: true,
                            });
                          }}
                          isLoading={followMut.isPending}
                          disabled={!profileUserId}
                          className="w-full flex items-center justify-start gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          <UserMinus className="w-4 h-4" />
                          Unfollow
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={handleFollowToggle}
                    isLoading={followMut.isPending}
                    disabled={!profileUserId}
                    variant="shiny"
                    className="w-full sm:w-auto px-6 py-2.5 text-[15px]"
                  >
                    <Plus className="w-4 h-4" />
                    Follow
                  </Button>
                ))}
            </div>
          </div>
        </div>

        {/* Divider / Grid space */}
        {/* Stats Grid */}
        <div className="mt-2 pt-6 border-t border-(--border-main) grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-sm">
          <StatBox
            isOwner={isOwner}
            to="/manage?tab=social&sub=followers"
            icon={Users}
            count={profile.followers_count}
            label="Followers"
            colorBg="bg-purple-50"
            colorText="text-purple-600"
            hoverClass="hover:bg-purple-500/5 hover:border-purple-500/30"
          />

          <StatBox
            isOwner={isOwner}
            to="/manage?tab=social&sub=following"
            icon={Users}
            count={profile.following_count}
            label="Following"
            colorBg="bg-blue-50"
            colorText="text-blue-600"
            hoverClass="hover:bg-blue-500/5 hover:border-blue-500/30"
          />

          <StatBox
            isOwner={isOwner}
            to="/discussions/my-posts"
            icon={MessageSquare}
            count={profile.discussion_count}
            label="Discussions"
            colorBg="bg-pink-50"
            colorText="text-pink-600"
            hoverClass="hover:bg-pink-500/5 hover:border-pink-500/30"
          />

          <StatBox
            isOwner={isOwner}
            to="/resources/my"
            icon={FileText}
            count={profile.resource_count}
            label="Resources"
            colorBg="bg-emerald-50"
            colorText="text-emerald-600"
            hoverClass="hover:bg-emerald-500/5 hover:border-emerald-500/30"
          />
        </div>
      </div>
    </div>
  );
};

const StatBox = ({
  isOwner,
  to,
  icon: Icon,
  count,
  label,
  colorBg,
  colorText,
  hoverClass,
}) => {
  const content = (
    <>
      <div
        className={`w-8 h-8 rounded-lg ${colorBg} flex items-center justify-center ${colorText} shrink-0 ${isOwner ? "group-hover/stat:scale-110 transition-transform" : ""}`}
      >
        <Icon className="w-4 h-4 pointer-events-none" />
      </div>
      <div className="flex flex-col min-w-0 text-left">
        <span className="font-bold text-(--text-main) leading-none truncate">
          {count || 0}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-(--text-muted) font-bold mt-1 truncate">
          {label}
        </span>
      </div>
    </>
  );

  const baseClasses =
    "flex items-center gap-2.5 text-(--text-muted) bg-(--bg-active) p-3 rounded-2xl border border-(--border-main) group/stat transition-all";

  if (isOwner) {
    return (
      <Link to={to} className={`${baseClasses} ${hoverClass}`}>
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
};

export default ProfileHeaderCard;
