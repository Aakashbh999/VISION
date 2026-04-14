import { Save, X } from "lucide-react";

const ProfileEditActionBar = ({
  isOwner,
  isEditMode,
  isSavingProfile,
  handleEditCancel,
  handleSaveChanges,
}) => {
  if (!isOwner || !isEditMode) return null;

  return (
    <div className="inline-flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl px-2 py-2 shadow-sm">
      <button
        type="button"
        onClick={handleEditCancel}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-8 rounded-lg bg-[var(--bg-active)] text-[var(--text-main)] font-semibold text-xs hover:opacity-90 transition-all active:scale-95"
      >
        <X className="w-3.5 h-3.5" /> Cancel
      </button>
      <button
        type="button"
        onClick={handleSaveChanges}
        disabled={isSavingProfile}
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-8 rounded-lg bg-purple-600 text-white font-semibold text-xs hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
      >
        {isSavingProfile ? (
          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <Save className="w-3.5 h-3.5" />
        )}
        <span>{isSavingProfile ? "Saving..." : "Save"}</span>
      </button>
    </div>
  );
};

export default ProfileEditActionBar;
