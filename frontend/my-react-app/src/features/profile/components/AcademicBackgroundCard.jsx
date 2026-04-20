import { Calendar, GraduationCap } from "lucide-react";

const AcademicBackgroundCard = ({
  profile,
  programs,
  isOwner,
  isEditMode,
  draftProfile,
  autoSemester,
  setDraftProfile,
  handleDraftChange,
}) => {
  return (
    <div className="bg-[var(--bg-card)] rounded-sm sm:rounded-3xl border border-[var(--border-main)] border-x-0 sm:border-x shadow-sm p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          Academic Background
        </h3>
      </div>

      {isOwner && isEditMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-black">
              Degree Program
            </label>
            <select
              value={draftProfile.program_id || ""}
              disabled
              title="Degree program cannot be changed after registration"
              className="w-full px-4 py-3 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] opacity-70 cursor-not-allowed transition-all appearance-none text-[var(--text-main)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <option value="">N/A</option>
              {programs?.map((program) => (
                <option key={program.program_id} value={program.program_id}>
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
              value={draftProfile.batch_year || "N/A"}
              readOnly
              disabled
              title="Batch year cannot be changed after registration"
              className="w-full px-4 py-3 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] opacity-70 cursor-not-allowed transition-all font-bold text-[var(--text-main)]"
            />
          </div>

          <div className="space-y-3 sm:col-span-2">
            <label className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-black">
              Studying at (Campus/University)
            </label>
            <input
              value={profile.campus_name || profile.campus || profile.university || "Not specified"}
              disabled
              readOnly
              title="Studying at cannot be changed after registration"
              className="w-full px-4 py-3 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] opacity-70 cursor-not-allowed transition-all text-[var(--text-main)] font-bold shadow-sm"
            />
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
                                currentDraft.semester || autoSemester || "",
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
                !draftProfile.semester_is_manual && !!draftProfile.batch_year
              }
              className="w-full px-4 py-3 rounded-sm sm:rounded-2xl border-2 border-[var(--border-main)] bg-[var(--bg-active)] focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none text-[var(--text-main)]"
            >
              <option value="">Select semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>

          </div>

          <div className="bg-[var(--bg-active)] p-6 rounded-sm sm:rounded-2xl border border-[var(--border-main)] sm:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black">
                  Member Since
                </p>
                <p className="text-base sm:text-lg font-bold text-[var(--text-main)] flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <label className="inline-flex items-center gap-2.5 text-xs font-bold text-[var(--text-main)] cursor-pointer select-none">
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={draftProfile.hide_member_since}
                    onChange={(e) => handleDraftChange("hide_member_since", e.target.checked)}
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--border-main)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
                Hide from profile
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-active)] p-4 sm:p-5 rounded-sm sm:rounded-2xl border border-[var(--border-main)]">
            <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
              Degree Program
            </p>
            <p className="text-lg font-bold text-[var(--text-main)]">
              {profile.program_name || "Self Taught / Other"}
            </p>
          </div>
          <div className="bg-[var(--bg-active)] p-4 sm:p-5 rounded-sm sm:rounded-2xl border border-[var(--border-main)]">
            <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
              Current Semester
            </p>
            <p className="text-lg font-bold text-[var(--text-main)]">
              {profile.semester ? profile.semester : "Not specified"}
            </p>
          </div>
          <div className="bg-[var(--bg-active)] p-4 sm:p-5 rounded-sm sm:rounded-2xl border border-[var(--border-main)] sm:col-span-2">
            <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
              Studying at
            </p>
            <p className="text-lg font-bold text-[var(--text-main)]">
              {profile.campus_name || profile.campus || profile.university || "Not specified"}
            </p>
          </div>
          <div className="bg-[var(--bg-active)] p-4 sm:p-5 rounded-sm sm:rounded-2xl border border-[var(--border-main)]">
            <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
              Batch Year
            </p>
            <p className="text-lg font-bold text-[var(--text-main)]">
              {profile.batch_year || "N/A"}
            </p>
          </div>
          {!profile.hide_member_since && (
            <div className="bg-[var(--bg-active)] p-4 sm:p-5 rounded-sm sm:rounded-2xl border border-[var(--border-main)]">
              <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
                Member Since
              </p>
              <p className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicBackgroundCard;
