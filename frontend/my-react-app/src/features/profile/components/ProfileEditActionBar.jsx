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
  );
};

export default ProfileEditActionBar;
