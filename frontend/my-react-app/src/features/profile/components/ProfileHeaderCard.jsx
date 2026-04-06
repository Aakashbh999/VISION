import {
  Camera,
  Check,
  ChevronDown,
  FileText,
  Github,
  Globe,
  Instagram,
  Linkedin,
  MessageSquare,
  PencilLine,
  Trash2,
  Twitter,
  UserMinus,
  Users,
  Youtube,
  Facebook,
} from "lucide-react";
import { RedditIcon } from "../utils/profileHelpers";

const ProfileHeaderCard = ({
  profile,
  isOwner,
  isEditMode,
  followDropdownOpen,
  setFollowDropdownOpen,
  followDropdownRef,
  followMut,
  handleFollowToggle,
  handleEditStart,
  setActiveEditor,
  setViewingAvatar,
  removeAvatarMut,
  removeBannerMut,
  draftProfile,
  handleDraftChange,
  programName,
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
    <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-3xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm overflow-hidden relative">
      <div className="h-56 relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden group/banner">
        {profile.banner_image && (
          <img
            src={profile.banner_image}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
        {isOwner && isEditMode && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center gap-3 opacity-0 group-hover/banner:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setActiveEditor("banner")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-900 text-sm font-bold shadow-lg"
            >
              <Camera className="w-4 h-4" /> Upload Banner
            </button>
            {profile.banner_image && (
              <button
                type="button"
                onClick={() => removeBannerMut.mutate()}
                disabled={removeBannerMut.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-bold shadow-lg disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4" />
                {removeBannerMut.isPending ? "Removing..." : "Remove"}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-8 lg:px-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12 sm:-mt-16 md:-mt-20 relative z-20">
          <div className="relative group/avatar">
            <div
              onClick={() => {
                if (isOwner && isEditMode) return;
                setViewingAvatar(true);
              }}
              className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white border-4 border-[var(--bg-card)] shadow-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500 overflow-hidden relative ${isOwner && !isEditMode ? "cursor-pointer" : ""}`}
            >
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-white">
                  {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}

              {profile.is_online && (
                <span className="absolute bottom-3 right-3 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
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

            {isOwner && isEditMode && profile.profile_image && (
              <button
                type="button"
                onClick={() => removeAvatarMut.mutate()}
                disabled={removeAvatarMut.isPending}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-lg disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {removeAvatarMut.isPending ? "Removing" : "Remove"}
              </button>
            )}
          </div>

          <div className="flex-1 pb-2 sm:pb-4 min-w-0">
            {isOwner && isEditMode ? (
              <div className="space-y-3 max-w-xl">
                <label className="block text-xs font-bold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Full Name
                </label>
                <input
                  value={draftProfile.full_name}
                  onChange={(event) =>
                    handleDraftChange("full_name", event.target.value)
                  }
                  className="w-full px-5 py-3.5 rounded-2xl border-2 border-purple-100 bg-white/80 backdrop-blur-sm text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-main)] focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm"
                  placeholder="Enter your full name"
                />
              </div>
            ) : (
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
                {profile.full_name}
                {profile.is_moderator && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Moderator
                  </span>
                )}
              </h1>
            )}

            {profile.is_online && (
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                Active recently
              </p>
            )}

            <p className="text-[var(--text-muted)] font-medium mt-2">
              {isOwner && isEditMode
                ? programName || "Select a degree program below"
                : profile.program_name || profile.email || "VISION Member"}
            </p>
          </div>

          <div className="pb-2 sm:pb-4 flex gap-3 flex-wrap">
            {!isOwner &&
              (profile.is_following ? (
                <div className="relative" ref={followDropdownRef}>
                  <button
                    onClick={() => setFollowDropdownOpen((open) => !open)}
                    disabled={followMut.isPending}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold bg-[var(--bg-active)] text-[var(--text-main)] hover:bg-[var(--border-main)] transition-all shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 text-purple-600" />
                    Following
                    <ChevronDown
                      className={`w-4 h-4 ml-0.5 transition-transform ${followDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {followDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-[var(--bg-card)] rounded-xl shadow-lg border border-[var(--border-main)] py-1 z-50">
                      <button
                        onClick={() => {
                          setFollowDropdownOpen(false);
                          followMut.mutate({
                            userId: profile.user_id,
                            isFollowing: true,
                          });
                        }}
                        disabled={followMut.isPending}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <UserMinus className="w-4 h-4" />
                        Unfollow
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleFollowToggle}
                  disabled={followMut.isPending}
                  className="px-6 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md transition-all shadow-sm disabled:opacity-50"
                >
                  {followMut.isPending ? "..." : "Follow"}
                </button>
              ))}

            {isOwner && !isEditMode && (
              <button
                type="button"
                onClick={handleEditStart}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold transition-all"
              >
                <PencilLine className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
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
                className={`p-2.5 rounded-2xl border border-[var(--border-main)] shadow-xs transition-all hover:scale-110 active:scale-95 ${social.color}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            );
          })}
        </div>

        <div className="mt-8 py-6 border-t border-[var(--border-main)] grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-sm">
          <div className="flex items-center gap-2.5 text-[var(--text-muted)] bg-[var(--bg-active)] p-3 rounded-2xl border border-[var(--border-main)]">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[var(--text-main)] leading-none truncate">
                {profile.followers_count || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mt-1 truncate">
                Followers
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-[var(--text-muted)] bg-[var(--bg-active)] p-3 rounded-2xl border border-[var(--border-main)]">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[var(--text-main)] leading-none truncate">
                {profile.following_count || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mt-1 truncate">
                Following
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-[var(--text-muted)] bg-[var(--bg-active)] p-3 rounded-2xl border border-[var(--border-main)]">
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[var(--text-main)] leading-none truncate">
                {profile.discussion_count || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mt-1 truncate">
                Discussions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-[var(--text-muted)] bg-[var(--bg-active)] p-3 rounded-2xl border border-[var(--border-main)]">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[var(--text-main)] leading-none truncate">
                {profile.resource_count || 0}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mt-1 truncate">
                Resources
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderCard;
