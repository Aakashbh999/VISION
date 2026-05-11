import { User, Globe } from "lucide-react";
import { RedditIcon } from "../utils/profileHelpers";

const AboutMeCard = ({
  profile,
  isOwner,
  isEditMode,
  draftProfile,
  currentBioWords,
  handleDraftChange,
  maxBioWords,
  systemTags = [],
  isTagsLoading = false,
}) => {
  const currentTags = draftProfile.career_scope
    ? draftProfile.career_scope.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const handleTagToggle = (tagName) => {
    let nextTags;
    if (currentTags.includes(tagName)) {
      nextTags = currentTags.filter((t) => t !== tagName);
    } else {
      if (currentTags.length >= 5) return;
      nextTags = [...currentTags, tagName];
    }
    handleDraftChange("career_scope", nextTags.join(", "));
  };
  const socialFields = [
    {
      key: "linkedin_url",
      label: "LinkedIn",
      icon: Globe,
      color: "text-blue-600",
    },
    {
      key: "github_url",
      label: "GitHub",
      icon: Globe,
      color: "text-slate-900",
    },
    {
      key: "facebook_url",
      label: "Facebook",
      icon: Globe,
      color: "text-blue-700",
    },
    {
      key: "instagram_url",
      label: "Instagram",
      icon: Globe,
      color: "text-pink-600",
    },
    {
      key: "twitter_url",
      label: "X (Twitter)",
      icon: Globe,
      color: "text-sky-500",
    },
    {
      key: "youtube_url",
      label: "YouTube",
      icon: Globe,
      color: "text-red-600",
    },
    {
      key: "reddit_url",
      label: "Reddit",
      icon: RedditIcon,
      color: "text-orange-600",
    },
    {
      key: "website_url",
      label: "Website",
      icon: Globe,
      color: "text-teal-600",
    },
  ];

  return (
    <>
      <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-3xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm p-8 transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <User className="w-5 h-5" />
            </div>
           Profile Bio
          </h3>
          {isOwner && isEditMode && (
            <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-100">
              Editing
            </span>
          )}
        </div>

        {}
        <div className="space-y-4">
          <p className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">
            About Me
          </p>
          {isOwner && isEditMode ? (
            <div className="space-y-4">
              <textarea
                value={draftProfile.bio}
                onChange={(event) => handleDraftChange("bio", event.target.value)}
                className="w-full text-base text-[var(--text-main)] bg-[var(--bg-active)] border-2 border-[var(--border-main)] focus:bg-[var(--bg-card)] rounded-2xl p-5 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all min-h-40 placeholder:text-[var(--text-muted)]"
                placeholder="Tell the community about yourself..."
              />
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className="text-[var(--text-muted)]">Word count</span>
                <span
                  className={
                    currentBioWords > maxBioWords
                      ? "text-rose-500"
                      : "text-purple-600"
                  }
                >
                  {currentBioWords} / {maxBioWords}
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

        {}
        <div className="mt-10 pt-8 border-t border-[var(--border-main)] space-y-4">
          <div className="flex justify-between items-end">
            <p className="text-sm font-black uppercase tracking-widest text-[var(--text-muted)] opacity-60">
              Interests
            </p>
            {isEditMode && (
              <span className={`text-[10px] font-bold uppercase tracking-widest ${currentTags.length >= 5 ? 'text-rose-500' : 'text-purple-600'}`}>
                {currentTags.length}/5 Selected
              </span>
            )}
          </div>

          {isOwner && isEditMode ? (
            <div className="flex flex-wrap gap-2.5">
              {isTagsLoading ? (
                <p className="text-xs text-[var(--text-muted)] italic">Loading tag options...</p>
              ) : systemTags.length > 0 ? (
                systemTags.map((tag) => {
                  const isSelected = currentTags.includes(tag.name);
                  return (
                    <button
                      key={tag.tag_id}
                      type="button"
                      onClick={() => handleTagToggle(tag.name)}
                      className={`px-4 py-2 rounded-xl text-[13px] font-bold border-2 transition-all ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600 text-white shadow-md scale-105'
                          : 'bg-[var(--bg-active)] border-[var(--border-main)] text-[var(--text-muted)] hover:border-purple-300'
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-rose-500 italic">No system tags available. Please check server logs.</p>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentTags.length > 0 ? (
                currentTags.map((interest, i) => (
                  <span
                    key={i}
                    className="px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-600 text-[13px] font-bold border border-purple-500/20"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <p className="text-sm italic text-[var(--text-muted)]">
                  No interests added yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {isOwner && isEditMode && (
        <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-3xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm p-8">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Globe className="w-5 h-5" />
            </div>
            Social Presence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {socialFields.map((social) => {
              const Icon = social.icon;
              return (
                <div key={social.key} className="space-y-2">
                  <label className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${social.color}`} />{" "}
                    {social.label}
                  </label>
                  <input
                    value={draftProfile[social.key]}
                    onChange={(event) =>
                      handleDraftChange(social.key, event.target.value)
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 text-sm rounded-sm sm:rounded-xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-[var(--text-main)]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default AboutMeCard;
