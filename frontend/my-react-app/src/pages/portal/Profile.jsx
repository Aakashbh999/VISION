import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Calendar,
  Award,
  Shield,
  Star,
  Camera,
  Check,
  X,
  Users,
  MessageSquare,
  FileText,
  ChevronDown,
  UserMinus,
  Trash2,
  PencilLine,
  Save,
  GraduationCap,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Github,
  Globe,
  Twitter,
} from "lucide-react";
import VisionImageEditor from "../../components/VisionImageEditor";
import { useAuth } from "../../context/AuthContext";
import {
  usePublicProfile,
  useOwnProfile,
  useUpdateProfile,
  useUpdateProfileImage,
  useUpdateProfileBanner,
  useRemoveProfileImage,
  useRemoveProfileBanner,
  useFollowUser,
} from "../../hooks/useProfile";
import { usePrograms } from "../../hooks/usePrograms";
import { showToast } from "../../utils/toast";
import { calculateSemesterFromBatch } from "../../utils/academic";

const MAX_BIO_WORDS = 130;

const RedditIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 11.5c0-1.654-1.346-3-3-3-.396 0-.77.081-1.114.223-1.644-1.22-3.903-2.007-6.398-2.126l1.353-6.347 4.417.941c.05 1.05.918 1.889 1.989 1.889 1.103 0 2-.897 2-2s-.897-2-2-2c-1.034 0-1.876.79-1.982 1.808l-4.904-1.045c-.171-.036-.347.051-.416.211L13.25 5.567c-2.55.074-4.878.783-6.577 2.016-.328-.135-.688-.203-1.057-.203-1.654 0-3 1.346-3 3 0 .977.472 1.84 1.196 2.38-.035.197-.059.399-.059.604 0 3.321 4.14 6.016 9.25 6.016s9.25-2.695 9.25-6.016c0-.202-.023-.401-.057-.594.743-.541 1.233-1.413 1.233-2.407zm-16.75 3.5c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5zm10.75 0c-.827 0-1.5-.673-1.5-1.5s.673-1.5 1.5-1.5 1.5.673 1.5 1.5-.673 1.5-1.5 1.5zm-1.096 4.398c-.689.689-1.785 1.102-2.904 1.102s-2.215-.413-2.904-1.102c-.146-.146-.146-.384 0-.53.147-.147.384-.146.53 0 .546.547 1.458.882 2.374.882s1.828-.335 2.374-.882c.073-.073.169-.11.265-.11s.192.037.265.11c.146.146.146.384 0 .53z"/>
  </svg>
);

const countWords = (text = "") =>
  text.trim().split(/\s+/).filter(Boolean).length;

const buildDraftProfile = (profile) => ({
  full_name: profile?.full_name || "",
  bio: profile?.bio || "",
  program_id: profile?.program_id ? String(profile.program_id) : "",
  batch_year: profile?.batch_year ? String(profile.batch_year) : "",
  semester: profile?.semester ? String(profile.semester) : "",
  semester_is_manual: Boolean(profile?.semester_is_manual),
  linkedin_url: profile?.linkedin_url || "",
  facebook_url: profile?.facebook_url || "",
  instagram_url: profile?.instagram_url || "",
  youtube_url: profile?.youtube_url || "",
  reddit_url: profile?.reddit_url || "",
  twitter_url: profile?.twitter_url || "",
  github_url: profile?.github_url || "",
  website_url: profile?.website_url || "",
});

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { data: programs } = usePrograms();

  const currentUserId = currentUser?.id ?? currentUser?.user_id;
  const isOwner = userId === "me" || userId === currentUserId?.toString();

  const { data: ownProfile, isLoading: isOwnLoading } = useOwnProfile({
    enabled: isOwner,
  });
  const { data: publicProfile, isLoading: isPublicLoading } = usePublicProfile(
    isOwner ? null : userId,
  );

  const profile = isOwner ? ownProfile : publicProfile;
  const isLoading = isOwner ? isOwnLoading : isPublicLoading;

  const updateProfileMut = useUpdateProfile();
  const updateAvatarMut = useUpdateProfileImage();
  const updateBannerMut = useUpdateProfileBanner();
  const removeAvatarMut = useRemoveProfileImage();
  const removeBannerMut = useRemoveProfileBanner();
  const followMut = useFollowUser();

  const [isEditMode, setIsEditMode] = useState(false);
  const [draftProfile, setDraftProfile] = useState(buildDraftProfile(null));
  const [followDropdownOpen, setFollowDropdownOpen] = useState(false);
  const [activeEditor, setActiveEditor] = useState(null);
  const [viewingAvatar, setViewingAvatar] = useState(false);

  const followDropdownRef = useRef(null);

  useEffect(() => {
    if (!profile || !isOwner) return;
    setDraftProfile(buildDraftProfile(profile));
  }, [profile, isOwner]);

  useEffect(() => {
    const handler = (event) => {
      if (
        followDropdownRef.current &&
        !followDropdownRef.current.contains(event.target)
      ) {
        setFollowDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isEditMode || draftProfile.semester_is_manual) return;

    const calculatedSemester = calculateSemesterFromBatch(
      draftProfile.batch_year,
    );
    if (!calculatedSemester) return;

    setDraftProfile((currentDraft) => {
      const nextSemester = String(calculatedSemester);
      if (currentDraft.semester === nextSemester) return currentDraft;
      return { ...currentDraft, semester: nextSemester };
    });
  }, [draftProfile.batch_year, draftProfile.semester_is_manual, isEditMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-200 border-t-purple-600"></div>
          <p className="text-sm text-[var(--text-muted)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)]">Profile not found.</div>
    );
  }

  const isSavingProfile = updateProfileMut.isPending;
  const currentBioWords = countWords(draftProfile.bio);
  const autoSemester = calculateSemesterFromBatch(draftProfile.batch_year);

  const handleDraftChange = (field, value) => {
    setDraftProfile((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  };

  const handleEditStart = () => {
    setDraftProfile(buildDraftProfile(profile));
    setIsEditMode(true);
  };

  const handleEditCancel = () => {
    setDraftProfile(buildDraftProfile(profile));
    setIsEditMode(false);
    setActiveEditor(null);
  };

  const handleSaveChanges = async () => {
    if (!draftProfile.full_name.trim()) {
      showToast.error("Full name is required.");
      return;
    }

    if (currentBioWords > MAX_BIO_WORDS) {
      showToast.error(`Bio cannot exceed ${MAX_BIO_WORDS} words.`);
      return;
    }

    if (!draftProfile.semester) {
      showToast.error("Semester is required.");
      return;
    }

    try {
      await updateProfileMut.mutateAsync({
        ...draftProfile,
        batch_year: draftProfile.batch_year || null,
        program_id: draftProfile.program_id || null,
      });
      setIsEditMode(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAvatarDone = (formData) => {
    formData.append("use_skip", "true");
    updateAvatarMut.mutate(formData, {
      onSettled: () => {
        setActiveEditor(null);
      },
    });
  };

  const handleBannerDone = (formData) => {
    formData.append("use_skip", "true");
    updateBannerMut.mutate(formData, {
      onSettled: () => {
        setActiveEditor(null);
      },
    });
  };

  const handleFollowToggle = () => {
    followMut.mutate({
      userId: profile.user_id,
      isFollowing: profile.is_following,
    });
  };

  const programName = programs?.find(
    (program) => String(program.program_id) === String(draftProfile.program_id),
  )?.program_name;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 max-w-5xl mx-auto pb-28">
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] shadow-sm overflow-hidden relative">
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
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-purple-100 bg-white/80 backdrop-blur-sm text-2xl sm:text-3xl font-bold text-[var(--text-main)] focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all shadow-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              ) : (
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
                  {profile.full_name}
                  {profile.is_moderator && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-bold uppercase tracking-wider">
                      <Shield className="w-3 h-3" /> Mod
                    </span>
                  )}
                </h1>
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
             {[
               { key: 'linkedin_url', icon: Linkedin, color: 'text-blue-600 hover:bg-blue-600 hover:text-white', label: 'LinkedIn' },
               { key: 'github_url', icon: Github, color: 'text-slate-900 hover:bg-slate-900 hover:text-white', label: 'GitHub' },
               { key: 'facebook_url', icon: Facebook, color: 'text-blue-700 hover:bg-blue-700 hover:text-white', label: 'Facebook' },
               { key: 'instagram_url', icon: Instagram, color: 'text-pink-600 hover:bg-pink-600 hover:text-white', label: 'Instagram' },
               { key: 'twitter_url', icon: Twitter, color: 'text-sky-500 hover:bg-sky-500 hover:text-white', label: 'Twitter' },
               { key: 'reddit_url', icon: RedditIcon, color: 'text-orange-600 hover:bg-orange-600 hover:text-white', label: 'Reddit' },
               { key: 'youtube_url', icon: Youtube, color: 'text-red-600 hover:bg-red-600 hover:text-white', label: 'YouTube' },
               { key: 'website_url', icon: Globe, color: 'text-teal-600 hover:bg-teal-600 hover:text-white', label: 'Website' },
             ].map((social) => {
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
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mt-1 truncate">Followers</span>
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
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mt-1 truncate">Following</span>
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
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mt-1 truncate">Discussions</span>
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
                <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold mt-1 truncate">Resources</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOwner && activeEditor === "avatar" && (
        <VisionImageEditor
          aspect={1}
          onDone={handleAvatarDone}
          onCancel={() => setActiveEditor(null)}
          isLoading={updateAvatarMut.isPending}
          asModal
        />
      )}

      {isOwner && activeEditor === "banner" && (
        <VisionImageEditor
          aspect={16 / 9}
          onDone={handleBannerDone}
          onCancel={() => setActiveEditor(null)}
          isLoading={updateBannerMut.isPending}
          asModal
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] shadow-sm p-8 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <User className="w-5 h-5" />
                </div>
                About Me
              </h3>
              {isOwner && isEditMode && (
                <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
                  Editing
                </span>
              )}
            </div>

            {isOwner && isEditMode ? (
              <div className="space-y-4">
                <textarea
                  value={draftProfile.bio}
                  onChange={(event) =>
                    handleDraftChange("bio", event.target.value)
                  }
                  className="w-full text-base text-[var(--text-main)] bg-white border-2 border-purple-50 rounded-2xl p-5 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all min-h-40 placeholder:text-[var(--text-muted)]"
                  placeholder="Tell the community about yourself..."
                />
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span className="text-[var(--text-muted)]">Word count</span>
                  <span className={currentBioWords > MAX_BIO_WORDS ? "text-rose-500" : "text-purple-600"}>
                    {currentBioWords} / {MAX_BIO_WORDS}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap text-base">
                {profile.bio ||
                  (isOwner
                    ? "Welcome to your profile! Use edit mode to tell the community a bit about yourself, your interests, and what you're working on."
                    : "This user hasn't added a bio yet.")}
              </p>
            )}
          </div>

          {isOwner && isEditMode && (
            <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] shadow-sm p-8">
              <h3 className="text-xl font-bold text-[var(--text-main)] mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Globe className="w-5 h-5" />
                </div>
                Social Presence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { key: 'linkedin_url', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
                  { key: 'github_url', label: 'GitHub', icon: Github, color: 'text-slate-900' },
                  { key: 'facebook_url', label: 'Facebook', icon: Facebook, color: 'text-blue-700' },
                  { key: 'instagram_url', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                  { key: 'twitter_url', label: 'X (Twitter)', icon: Twitter, color: 'text-sky-500' },
                  { key: 'youtube_url', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
                  { key: 'reddit_url', label: 'Reddit', icon: RedditIcon, color: 'text-orange-600' },
                  { key: 'website_url', label: 'Website', icon: Globe, color: 'text-teal-600' },
                ].map((social) => (
                  <div key={social.key} className="space-y-2">
                    <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                      <social.icon className={`w-3.5 h-3.5 ${social.color}`} /> {social.label}
                    </label>
                    <input
                      value={draftProfile[social.key]}
                      onChange={(e) => handleDraftChange(social.key, e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 text-sm rounded-xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-[var(--text-main)]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] shadow-sm p-8">
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
        <GraduationCap className="w-5 h-5" />
      </div>
      Academic Background
    </h3>
    {isOwner &&
      !draftProfile.semester_is_manual &&
      draftProfile.batch_year && (
        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          Auto Semester
        </span>
      )}
  </div>

  {isOwner && isEditMode ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
      <div className="space-y-3">
        <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-black">
          Degree Program
        </label>
        <select
          value={draftProfile.program_id}
          onChange={(event) =>
            handleDraftChange("program_id", event.target.value)
          }
          className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all appearance-none cursor-pointer text-[var(--text-main)]"
        >
          <option value="">Select program</option>
          {programs?.map((program) => (
            <option
              key={program.program_id}
              value={program.program_id}
            >
              {program.program_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-black">
          Batch Year
        </label>
        <input
          value={draftProfile.batch_year}
          onChange={(event) =>
            handleDraftChange(
              "batch_year",
              event.target.value.replace(/[^0-9]/g, "").slice(0, 4),
            )
          }
          placeholder="e.g. 2079"
          className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all font-bold text-[var(--text-main)]"
        />
        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">
          Required for auto-semester calculation
        </p>
      </div>

      <div className="space-y-4 sm:col-span-2">
        <div className="flex items-center justify-between gap-4">
          <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-black">
            Current Semester
          </label>
          <label className="inline-flex items-center gap-2.5 text-xs font-bold text-[var(--text-main)] cursor-pointer select-none">
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={draftProfile.semester_is_manual}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setDraftProfile((currentDraft) => ({
                    ...currentDraft,
                    semester_is_manual: checked,
                    semester:
                      !checked && currentDraft.batch_year
                        ? String(
                            calculateSemesterFromBatch(
                              currentDraft.batch_year,
                            ) || currentDraft.semester,
                          )
                        : currentDraft.semester,
                  }));
                }}
              />
              <div className="w-10 h-5 bg-[var(--bg-active)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-main)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </div>
            Manual Override
          </label>
        </div>

        <select
          value={draftProfile.semester}
          onChange={(event) =>
            handleDraftChange("semester", event.target.value)
          }
          disabled={
            !draftProfile.semester_is_manual &&
            !!draftProfile.batch_year
          }
          className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none text-[var(--text-main)]"
        >
          <option value="">Select semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((semester) => (
            <option key={semester} value={semester}>
              Semester {semester}
            </option>
          ))}
        </select>

        {!draftProfile.semester_is_manual &&
          draftProfile.batch_year && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <p className="text-xs text-emerald-700 font-bold">
                System predicted: Semester {autoSemester || "-"}
              </p>
            </div>
          )}
      </div>

      <div className="bg-[var(--bg-active)] p-6 rounded-2xl border border-[var(--border-main)] sm:col-span-2">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black mb-2">
          Member Since
        </p>
        <p className="text-lg font-bold text-[var(--text-main)] flex items-center gap-3">
          <Calendar className="w-5 h-5 text-purple-600" />
          {new Date(profile.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-[var(--bg-card)] p-5 rounded-2xl border-2 border-[var(--border-main)] hover:border-purple-100 transition-all">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black mb-2">
          Degree Program
        </p>
        <p className="text-base font-bold text-[var(--text-main)]">
          {profile.program_name || "Self Taught / Other"}
        </p>
      </div>
      <div className="bg-[var(--bg-card)] p-5 rounded-2xl border-2 border-[var(--border-main)] hover:border-purple-100 transition-all">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black mb-2">
          Current Semester
        </p>
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-[var(--text-main)]">
            {profile.semester
              ? `Semester ${profile.semester}`
              : "Not specified"}
          </p>
          {profile.batch_year && !profile.semester_is_manual && (
            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">Auto</span>
          )}
        </div>
      </div>
      <div className="bg-[var(--bg-card)] p-5 rounded-2xl border-2 border-[var(--border-main)] hover:border-purple-100 transition-all">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black mb-2">
          Batch Year
        </p>
        <p className="text-base font-bold text-[var(--text-main)]">
          {profile.batch_year || "N/A"}
        </p>
      </div>
      <div className="bg-[var(--bg-card)] p-5 rounded-2xl border-2 border-[var(--border-main)] hover:border-purple-100 transition-all">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black mb-2">
          Member Since
        </p>
        <p className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600" />
          {new Date(profile.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  )}
</div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-950 rounded-3xl shadow-2xl p-1.5 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-purple-500/30 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[1.4rem] p-8 relative z-10 border border-white/10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-3 text-purple-200">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 backdrop-blur-sm flex items-center justify-center border border-purple-500/30">
                    <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  </div>
                  VisionXP
                </h3>
                {isOwner && (
                  <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-3 py-1 rounded-full">
                    Active
                  </span>
                )}
              </div>

              <div className="text-center mb-10">
                <div className="relative inline-block">
                  <p className="text-7xl font-black tracking-tighter mb-1 bg-gradient-to-b from-white to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">
                    {profile.total_xp || 0}
                  </p>
                  <div className="absolute -right-6 -top-2">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                    </span>
                  </div>
                </div>
                <p className="text-xs text-purple-300/60 font-black uppercase tracking-[0.2em] mt-2">
                  Total Experience Points
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/5 hover:bg-white/10 transition-all">
                  <p className="text-3xl font-black text-white">
                    {profile.current_level || 1}
                  </p>
                  <p className="text-[10px] text-purple-300 uppercase tracking-widest font-black mt-2">
                    Member Level
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex justify-center mb-2">
                    <Award className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                  </div>
                  <p className="text-3xl font-black text-white">
                    {profile.reputation_points || 0}
                  </p>
                  <p className="text-[10px] text-purple-300 uppercase tracking-widest font-black mt-2">
                    Reputation
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-purple-300">Level Progress</span>
                   <span className="text-[10px] font-black text-white">75%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                   <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full w-[75%]"></div>
                </div>
              </div>
            </div>
          </div>

         <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-main)] shadow-sm p-8 transition-all hover:shadow-md">
  <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
      <Award className="w-4 h-4" />
    </div>
    Achievements & Badges
  </h3>
  {profile.badges && profile.badges.length > 0 ? (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {profile.badges.map((badge, index) => (
        <div
          key={index}
          className="group flex flex-col items-center bg-[var(--bg-active)] border border-[var(--border-main)] rounded-2xl p-4 text-center transition-all hover:bg-[var(--bg-card)] hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 hover:border-amber-200"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 shadow-inner group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-xs font-black text-[var(--text-main)] leading-tight uppercase tracking-wider">
            {badge.badge_name}
          </span>
        </div>
      ))}
    </div>
  ) : (
    <div className="text-center py-10 bg-[var(--bg-active)] rounded-[2rem] border-2 border-dashed border-[var(--border-main)]">
      <div className="w-16 h-16 bg-[var(--bg-card)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <Award className="w-8 h-8 text-[var(--text-muted)]" />
      </div>
      <p className="text-sm font-bold text-[var(--text-muted)]">Unlock your first badge today!</p>
    </div>
  )}
</div>
        </div>
      </div>

      {viewingAvatar && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setViewingAvatar(false)}
        >
          <button
            onClick={(event) => {
              event.stopPropagation();
              setViewingAvatar(false);
            }}
            className="absolute top-4 left-4 bg-white/10 hover:bg-white/25 text-white p-2.5 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="flex flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            {profile.profile_image ? (
              <img
                src={profile.profile_image}
                alt={profile.full_name}
                className="max-w-[88vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl">
                <span className="text-8xl font-bold text-white">
                  {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            )}
            <p className="text-white/70 text-sm font-medium">
              {profile.full_name}
            </p>
          </div>
        </div>
      )}

      {isOwner && isEditMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
          <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-4 sm:p-5 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-center justify-between gap-6 px-10">
            <div className="hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <p className="text-sm font-black uppercase tracking-widest text-white">
                  Profile Editor
                </p>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                You have unsaved changes
              </p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleEditCancel}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-white/5 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 active:scale-95"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSavingProfile}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 px-10 py-3.5 rounded-2xl bg-purple-600 text-white font-black text-xs uppercase tracking-widest hover:bg-purple-500 shadow-xl shadow-purple-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {isSavingProfile ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSavingProfile ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;